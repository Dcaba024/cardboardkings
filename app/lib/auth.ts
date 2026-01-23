import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getIsAdmin() {
  const { userId, orgRole } = await auth();
  if (!userId) {
    return false;
  }
  if (orgRole === "org:admin") {
    return true;
  }
  const client = await clerkClient();
  const memberships = await client.users.getOrganizationMembershipList({
    userId,
  });
  return memberships.data.some((membership) => membership.role === "org:admin");
}
