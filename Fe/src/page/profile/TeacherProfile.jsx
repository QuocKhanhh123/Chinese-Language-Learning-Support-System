export default function TeacherProfile({ profile }) {
    return (
      <div>
        <h2>{profile.name} (Teacher)</h2>
        <p>Email: {profile.email}</p>
      </div>
    );
  }