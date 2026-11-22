# EQUIP account data audit

## Identity fields supplied by Google Authentication

Firebase Authentication stores and provides:

- Firebase UID
- Name / display name
- Email address
- Google profile picture URL
- Provider identity
- Email verification state
- Creation and last sign-in timestamps

EQUIP does not collect or store passwords.

## EQUIP application account fields

Firebase account profiles are designed around these fields:

| Field | Used for | Account types |
|---|---|---|
| `uid` | Identity and document ID | All |
| `name` | Navigation, dashboard, project submissions, facilitator display | All |
| `email` | Account display and program/facilitator contact | All |
| `photoURL` | Navbar, account, and roster avatars | All |
| `role` | Route guards and role-specific views: `student` or `facilitator` | Student / Facilitator |
| `grade` | Student dashboard/project team defaults | Student |
| `facilitatorStatus` | Pending, approved, or rejected facilitator approval state | Facilitator |
| `programId` | Student membership or facilitator program ownership | Student / Facilitator |
| `createdAt` | Account creation timestamp | All |
| `updatedAt` | Profile synchronization timestamp | All |

## Program and workspace data

- `programs/{programId}` stores program details, facilitator contact details, public visibility, and approval state.
- `programJoinCodeRecords/{programId}` and `programCodeIndex/{code}` store program access codes separately from public program documents; only program owners and signed-in students can retrieve a code-index document by its exact code.
- `programs/{programId}/periods/{periodId}` stores class-period names.
- `programs/{programId}/roster/{studentUid}` stores student membership, grade, avatar URL, join date, and period assignment.
- `programs/{programId}/technologies/{technologyId}` stores inventory and equipment image URLs.
- `programs/{programId}/projects/{projectId}` stores project descriptions, team members, image URLs, communication logs, period tags, and review state.
- Facilitator approval state remains in the facilitator's `users/{uid}` profile. Facilitator contact information belongs to the program, not authentication.
- The manager role is derived from the verified administrator email; it is not a user-selectable or stored profile role.
- Interface appearance preferences are stored locally in the browser.

Image binaries are uploaded to Cloudinary; Firestore stores only Cloudinary secure URLs. Google profile images remain Google-provided URLs.

Existing local browser program/workspace records are intentionally not migrated. New Firestore workspaces start empty; old localStorage values are left unused in the browser.
