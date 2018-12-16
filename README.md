# Caucus
A nodejs module for creating a server that creates client-side socket authorities for hosting multiuser negotiated instances. Currently testing on http://caucus.network.

## nodejs - server.js
 #### PLANNED
Responsibilities: 
- identify separate clients
- field requests for creation of new rooms
  - establish room IDs by username/internal user ID
- field requests for entry to 
- allow user creation
- save user details, authentication
...
 #### IMPLEMENTED
  [none]
## js - client-server.js
 #### PLANNED
Responsibilities:
- store state to local cache using (localforage?)
  - store room ID
  - establish possibility for multiple saved rooms and choice between which room to enter
  - store permissions for room entry and saved previous client states
  ...
- establish authority and client roles
  - authority responsibilities
    - negotiate conflicts
    - save security info
    - save permission info
    - keep channel open to main server for room entry requests
    - field requests forwarded from main server for user entry to room
    - take handoff of user comms from main server once user is accepted 
    ...
  - client responsibilities/limitations
    - cache session state info with timestamp and authority ID
    - can't initialize info without permission of authority user
    ...
 #### IMPLEMENTED
    [none]
