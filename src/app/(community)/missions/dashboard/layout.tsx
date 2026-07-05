
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col ">
            {/* CONTENT */}
      <div className="flex-1 bg-none" >{children}</div>
    </div>
  );
}
