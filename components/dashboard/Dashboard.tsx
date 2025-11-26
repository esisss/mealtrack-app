"use client"

export const Dashboard = ({ user }: { user: { id: string, displayName: string } }) => {
    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
            </div>

        </div>
    )
}
