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
  pwd: 'text',
  role: 'participant | experimenter | admin',
  gender: 'male | female | unknown',
  birthday: 'date',
  email: 'text',
  phone: 'text?',
};
task = {
  owner: 'user.id',
  name: 'text',
  desc: 'text',
  type: 'online | offline',
  status: 'pending | publish | archived',
};

// lab recuritment system
lab = {
  location: 'text',
};
task_event = {
  task: 'task.id',
  name: 'text',
  capacity: 'int:2',
  lab: 'lab.id',
  start_at: 'date',
  end_at: 'date',
};
task_event_user_rel = {
  event: 'task_event.id',
  user: 'user.id',
  as: 'participant | experimenter | other',
};

// generate by experimental program
task_session = {
  task: 'task.id',
  event: 'task_event.id?',
  start_at: 'date',
  end_at: 'date?',
};
task_session_participant_rel = {
  session: 'task_session.id',
  participant: 'user.id',
};
task_record = {
  session: 'task_session.id',
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
