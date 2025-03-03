// Helper functions for checking edit permissions
export function canEditForumPost(userId: string | undefined, authorId: string, createdAt: string, userRole?: string): boolean {
  if (!userId) return false;
  if (userRole === 'super_admin') return true;
  
  // Original poster can edit within 24 hours
  const postDate = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
  
  return userId === authorId && hoursDiff <= 24;
}

export function canEditAnnouncement(userRole?: string): boolean {
  return userRole === 'super_admin';
}

export function canEditReferral(userId: string | undefined, authorId: string, userRole?: string): boolean {
  if (!userId) return false;
  return userRole === 'super_admin' || userId === authorId;
}

export function canEditCaseReport(userId: string | undefined, authorId: string, userRole?: string): boolean {
  if (!userId) return false;
  return userRole === 'super_admin' || userId === authorId;
}