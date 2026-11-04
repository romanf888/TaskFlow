# Security Specification & Test Plan

## 1. Data Invariants
1. Boards and tasks can only be accessed, created, updated, and deleted by their authenticated owner (`request.auth.uid == ownerId`).
2. Document IDs in `/boards/{boardId}` and `/boards/{boardId}/tasks/{taskId}` must conform to safe regex patterns (`^[a-zA-Z0-9_\-]+$`) and max length 128 chars.
3. Every task must be linked to a valid parent board owned by the requesting user.
4. Tasks can only have status values among: `'todo'`, `'in_progress'`, `'done'`.
5. Tags and subtask arrays are strictly bounded (tags max size 15, subtasks max size 50) to prevent Denial of Wallet exhaustion.
6. The `ownerId` and `boardId` fields are strictly immutable upon update (`incoming().ownerId == existing().ownerId`).
7. Default-deny rule applies to all unmatched paths.

## 2. The "Dirty Dozen" Payloads (Must be rejected with PERMISSION_DENIED)
1. **Unauthenticated Read Board**: Anonymous or unauthenticated GET `/boards/board123`.
2. **Cross-Tenant Read Board**: Authenticated user B attempting GET on board owned by user A.
3. **Identity Spoofing on Board Create**: User A attempting to create board with `ownerId: "user_B"`.
4. **ID Injection Poisoning**: Document creation with 500-char non-alphanumeric path ID `/boards/%%$$evil&&`.
5. **Ghost Field Injection**: Adding unknown malicious property `isAdmin: true` into Board.
6. **Task Without Valid Owner**: User A creating a task where `ownerId` does not match `request.auth.uid`.
7. **Task Status Poisoning**: User attempting to set `status: "deleted_or_hacked"` outside of enum `['todo', 'in_progress', 'done']`.
8. **Unbounded Array Injection**: Attempting to store an array of 5,000 tag strings in a single task document.
9. **Ownership Transfer Attack**: User attempting to update `ownerId` of an existing board or task.
10. **Cross-Tenant Subcollection Query**: User B querying tasks under `/boards/user_A_board/tasks`.
11. **Malicious Giant Text Injection**: Attempting to store a 2MB string in the task title.
12. **Parent Board Mismatch**: Creating a task in `/boards/board123/tasks` with `boardId: "board999"`.
