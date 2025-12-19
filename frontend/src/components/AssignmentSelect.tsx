type Props = {
    taskId: string;
    currentAssigneeId: string;
    users: Array<{
        id: string;
        name: string;
        email: string;
    }>;
    onAssign: (userId: string) => Promise<void>;
};

export default function AssignmentSelect({
    currentAssigneeId,
    users,
    onAssign
}: Props) {
    return (
        <select
            value={currentAssigneeId || ""}
            onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                onAssign(value)
            }}
            className="border rounded px-2 py-1 text-sm bg-white"
        >
            <option value="" disabled>
                Assign user
            </option>

            {users.map(user => (
                <option key={user.id} value="{user.id}">
                    {user.name} ({user.email})
                </option>
            ))}
        </select>
    );
}