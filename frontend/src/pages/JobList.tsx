import React, { useEffect, useState } from "react";
import { listJobs } from "../api";

export default function JobList() {
  const [jobs, setJobs] = useState<any[]>([]);
  useEffect(() => {
    listJobs().then(setJobs);
  }, []);
  return (
    <div>
      <h1>Open Jobs</h1>
      {jobs.map(j => (
        <div key={j.id} style={{border: "1px solid #ddd", padding: 12, margin: 8}}>
          <h3>{j.title}</h3>
          <p>{j.description}</p>
          <a href={`/apply?job=${j.id}`}>Apply</a>
        </div>
      ))}
    </div>
  )
}
