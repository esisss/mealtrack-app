export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen ">
      <main className="flex-1 sm:absolute sm:right-0 sm:top-0 sm:w-[calc(100%-250px)]">
        {children}
      </main>
    </div>
  );
}
