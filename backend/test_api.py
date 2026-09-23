"""Offline integration checks: no OpenAI calls and no real credentials are used."""
from io import BytesIO
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / '.backend-deps'))
from docx import Document
from fastapi.testclient import TestClient
import backend.app as api


def docx(text):
    document = Document()
    document.add_paragraph(text)
    buffer = BytesIO()
    document.save(buffer)
    return buffer.getvalue()


class BackendTests(unittest.TestCase):
    def setUp(self):
        api.sessions.clear()
        self.client = TestClient(api.app)

    def upload(self):
        response = self.client.post('/api/documents', files={
            'old_document': ('old.docx', docx('3.5. Original director')),
            'new_document': ('new.docx', docx('3.5. New director')),
        })
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()['session_id']

    def test_full_contract_with_mock_model(self):
        session_id = self.upload()

        async def fake(schema, task, payload):
            if schema is api.Analysis:
                return api.Analysis(summary='Mock result', changes=[api.Finding(
                    type='modified', title='Director changed', description='Fixture only',
                    impact='high', source_ids=['A0001', 'B0001'])])
            return api.Insight(answer='Fixture answer', source_ids=['B0001'], highlight_change_ids=['C1'])

        with patch.object(api, 'ask_model', fake):
            analyzed = self.client.post('/api/analyze', json={'session_id': session_id})
            self.assertEqual(analyzed.status_code, 200, analyzed.text)
            finding = analyzed.json()['changes'][0]
            self.assertEqual(finding['sources'][0]['text'], '3.5. Original director')
            self.assertIsNone(analyzed.json()['confidence'])
            evidence = self.client.get('/api/evidence/' + finding['evidence_id'])
            self.assertEqual(evidence.json()['sources'], finding['sources'])
            answer = self.client.post('/api/agent', json={'session_id': session_id, 'message': 'What changed?'})
            self.assertEqual(answer.status_code, 200, answer.text)
            self.assertEqual(answer.json()['highlight_change_ids'], ['C1'])
            self.assertEqual(self.client.get('/api/session/' + session_id).status_code, 200)

    def test_fabricated_citation_rejected(self):
        session_id = self.upload()

        async def fake(*args):
            return api.Analysis(summary='Bad output', changes=[api.Finding(
                type='added', title='Invented', description='Invalid citation',
                impact='low', source_ids=['DOES-NOT-EXIST'])])

        with patch.object(api, 'ask_model', fake):
            response = self.client.post('/api/analyze', json={'session_id': session_id})
        self.assertEqual(response.status_code, 502)
        self.assertIsNone(api.sessions[session_id]['result'])
        self.assertFalse(api.sessions[session_id]['busy'])

    def test_bad_file_and_external_origin_rejected(self):
        response = self.client.post('/api/documents', files={
            'old_document': ('bad.docx', b'broken zip'), 'new_document': ('ok.docx', docx('Text'))})
        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.client.post('/api/analyze', json={'session_id': 'missing'},
                                         headers={'origin': 'https://untrusted.example'}).status_code, 403)

    def test_live_assets_do_not_expose_env(self):
        self.assertEqual(self.client.get('/.env').status_code, 404)
        self.assertEqual(self.client.get('/project/dark.env').status_code, 404)
        script = self.client.get('/script.js')
        self.assertIn('const DEMO_MODE = false;', script.text)
        self.assertEqual(self.client.get('/api/health').status_code, 200)


if __name__ == '__main__':
    unittest.main(verbosity=2)
