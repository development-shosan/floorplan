import React from 'react';

// 仮の型定義。実際の型は src/types/index.ts などで定義します。
type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
};

interface TeamMemberListProps {
  members: Member[];
}

export const TeamMemberList = ({ members }: TeamMemberListProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
