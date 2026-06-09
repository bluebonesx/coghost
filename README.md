## needs

### participant

- participate/withdraw online task
- schedule/cancel offline task
- download own record

### experimenter

- schedule/cancel lab
- create/publish/unpublish/archive task
- add/remove participant

### admin

- add/remove lab
- add new column
- global config
  - consent

## tables

```ts
user = {
  name: 'text',
  role: 'participant | experimenter | admin',
  birth: 'date',
  gender: 'enum',
  phone: 'text?',
  email: 'text',
};
task = {
  owner: 'user.id',
  name: 'text',
  desc: 'text',
  type: 'online | offline',
  status: 'pending | publish | archived',
  dirpath: 'text',
};

// lab recuritment system
lab = {
  location: 'text',
};
event = {
  task: 'task.id',
  name: 'text',
  capacity: 'int:2',
  lab: 'lab.id',
  from: 'date',
  to: 'date',
};
event_user_rel = {
  event: 'event.id',
  user: 'user.id',
  as: 'participant | experimenter | other',
};

// generate by experimental program
session = {
  task: 'task.id',
  event: 'event.id?',
  from: 'date',
  to: 'date?',
};
session_participant_rel = {
  session: 'session.id',
  participant: 'user.id',
};
record = {
  session: 'session.id',
  data: 'json',
};
```

## pages

| route            | desc                            | I              | O         |
| ---------------- | ------------------------------- | -------------- | --------- |
| /                | task list & details & /task/:id |
| /task/:id        | launch/schedule                 | task.id        |
| /task/:id/launch | launch online experiment        | session/record |
| /tasks           | task list & details & events    |                | own tasks |
