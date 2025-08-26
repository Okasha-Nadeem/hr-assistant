import React from "react";

type Job = {
  id: number;
  title: string;
  description: string;
  requirements?: string;
};

export default function JobCard({ job, onApply }: { job: Job; onApply?: (id: number) => void }) {
  return (
    <div className="card">
      <h3 className="card-title">{job.title}</h3>
      <p className="card-desc">{job.description}</p>
      {job.requirements && <p className="card-req"><strong>Req:</strong> {job.requirements}</p>}
      <div style={{ marginTop: 10 }}>
        <a className="btn" href={`/apply?job=${job.id}`}>Apply</a>
        {onApply && <button className="btn ghost" onClick={() => onApply(job.id)} style={{ marginLeft: 8 }}>Quick Apply</button>}
      </div>
    </div>
  );
}
