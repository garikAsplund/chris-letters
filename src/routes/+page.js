// src/routes/+page.js
export function load({ url }) {
    const PROLIFIC_PID = url.searchParams.get('PROLIFIC_PID');
    const STUDY_ID = url.searchParams.get('STUDY_ID');
    const SESSION_ID = url.searchParams.get('SESSION_ID');
  
    return {
      prolificParams: { PROLIFIC_PID, STUDY_ID, SESSION_ID }
    };
  }