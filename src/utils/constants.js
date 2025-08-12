export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member"
}

export const AvailableRoles = Object.values(UserRolesEnum);

export const TaskStatusesEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done"
}

export const AvailableTaskStatuses = Object.values(TaskStatusesEnum);