import { useNotifications } from "app/hooks/useNotifications";

export default function Notifications() {
    const { data, isLoading } = useNotifications();

    if(isLoading) return null;
    if(!data || data.length === 0)  return null;

    return (
        <div className="bg-white border rounded p-3 mb-4">
            <h3 className="font-semibold mb-2">Notifications</h3>
            <ul className="space-y-1">
                {data.map((n:any) => (
                    <li key={n.id} className="text-sm">
                        {n.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}