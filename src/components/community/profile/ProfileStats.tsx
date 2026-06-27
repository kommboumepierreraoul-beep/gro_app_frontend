"use client";

export default function ProfileStats() {
  const stats = [
    { label: "Posts", value: 42 },
    { label: "Abonnés", value: 1250 },
    { label: "Abonnements", value: 340 },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex justify-around">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
