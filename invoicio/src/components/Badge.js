import React from 'react';

const statusMap = {
  draft: 'badge-draft',
  pending: 'badge-pending',
  paid: 'badge-paid',
};

export default function Badge({ status }) {
  return (
    <span className={`badge ${statusMap[status] || 'badge-draft'}`}>
      {status}
    </span>
  );
}
