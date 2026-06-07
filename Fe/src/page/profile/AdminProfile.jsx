import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/network/httpRequest";

export default function AdminProfile({ profile }) {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user/get-users");
      return res.data.data.users;
    },
  });

  return (
    <div>
      <h2>{profile.name} (Admin)</h2>

      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.email} – {u.role} – {u.status}
          </li>
        ))}
      </ul>
    </div>
  );
}