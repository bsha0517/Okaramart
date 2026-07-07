import { prisma } from "@/lib/prisma";
import StaffForm from "@/components/StaffForm";
import StaffToggle from "@/components/StaffToggle";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const staff = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "MANAGER", "PACKER", "RIDER"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-6">Team & roles</h1>

      <div className="mb-8">
        <StaffForm />
      </div>

      <div className="bg-white rounded-xl border border-canal/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-husk text-left text-char/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-canal/5">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.phone}</td>
                <td className="px-4 py-3">{s.role.replace(/_/g, " ")}</td>
                <td className="px-4 py-3"><StaffToggle id={s.id} isActive={s.isActive} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
