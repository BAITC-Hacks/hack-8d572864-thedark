# Agent API келісімі

Frontend: `script.js` ішінде DEMO_MODE=false және API_BASE орнатыңыз. API_BASE соңына slash қоспаңыз. Барлық сәтті жауап JSON. Қателер HTTP 4xx/5xx арқылы беріледі; frontend HTTP статусын көрсетеді. Төмендегі сандар — келісім мысалы, нақты талдау нәтижесі емес.

## POST /api/documents

multipart/form-data: `old_document`, `new_document`. Екі файл да PDF/DOCX/XLSX; клиент шегі 20 MB. Сервер мазмұн мен қауіпсіздікті өзі тексереді.

```json
{"session_id":"s-123"}
```

## POST /api/analyze

Кіріс: `{"session_id":"s-123"}`. Толық нәтижені қайтарыңыз (HTTP 202 polling әзірге қолдау таппайды). Ең ұзақ күту — 120 секунд.

```json
{
  "summary":"Талдау қорытындысы",
  "confidence":null,
  "functions_detected":47,
  "changes":[{
    "id":"C1",
    "type":"modified",
    "title":"Жауапты рөл өзгерді",
    "description":"Бастапқы және кейінгі тармақтар түсіндірмесі.",
    "impact":"high",
    "confidence":null,
    "similarity":null,
    "evidence_id":"ev-1",
    "sources":[
      {"side":"before","document":"Бастапқы ереже","filename":"before.docx","point":"3.5","text":"Нақты үзінді","highlight":"үзінді"},
      {"side":"after","document":"Жаңа ереже","filename":"after.docx","point":"3.5","text":"Жаңартылған үзінді","highlight":"Жаңартылған"}
    ]
  }]
}
```

`type`: added / removed / modified / duplicate. `id` бірегей жол. confidence/similarity 0–100 сан немесе null; жоқ метриканы frontend ойлап қоспайды. `sources.side` before / after. Нұсқасы белгісіз дереккөздер бөлек көрсетіледі.

Экспорттың толық болуы үшін sources мәтінін analyze жауабына қосыңыз. evidence_id болғанда Source Trace жаңа үзіндіні төмендегі endpoint арқылы жүктейді. Тармақтар, үзінділер, сәйкестік және confidence дұрыстығына backend жауапты.

## POST /api/agent

```json
{"session_id":"s-123","message":"Жауапты рөл қалай өзгерді?"}
```

Жауап:

```json
{"answer":"Дереккөздерге сүйенген түсіндірме","highlight_change_ids":["C1"],"sources":[]}
```

Тек картадағы бар ID-лер жарықтандырылады. sources форматы analyze жауабымен бірдей.

## GET /api/session/:id

Settings → «Сервер сессиясын қалпына келтіру». analyze сияқты нәтиже немесе `{"result":{...}}`. Браузер бастапқы File объектілерін қалпына келтірмейді. Қайта талдау үшін файлдарды қайта таңдау керек.

## GET /api/evidence/:id

Жауап: `{"sources":[...]}`. Source Trace `evidence_id` бар тұжырымды ашқанда шақырылады. Сервер жауабы кейінгі экспорт үшін де сақталады.

## Іске қосу шарттары

Frontend origin үшін CORS рұқсаты; LLM кілттері тек серверде. Сессияларға қолжетімділік, авторизация, файл сақтау мерзімі және сервер тапсырмасын тоқтату механизмі backend міндеті. Бұл frontend статикалық server.cjs арқылы API-ді прокси жасамайды.
