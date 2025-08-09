'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

type UserRow = {
  id: string;
  username: string;
  accuracy: number;
  total_score: number;
};

export default function Leaderboard() {
  const supabase = useSupabaseClient();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, username, accuracy, total_score')
        .order('total_score', { ascending: false });

      if (!error && data) setUsers(data);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [supabase]);

  return (
    <>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Leaderboard</h1>
        <table className="w-full bg-white rounded-lg shadow border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Rank</th>
              <th className="py-2 px-4 text-left">Username</th>
              <th className="py-2 px-4 text-right">Total Score</th>
              <th className="py-2 px-4 text-right">Accuracy (%)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  No users yet.
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} className="border-t">
                  <td className="py-2 px-4 font-semibold text-gray-700">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-4">{user.username}</td>
                  <td className="py-2 px-4 text-right">{user.total_score}</td>
                  <td className="py-2 px-4 text-right">
                    {user.accuracy ? user.accuracy.toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
