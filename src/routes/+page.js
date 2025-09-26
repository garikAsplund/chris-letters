	// completion URL example
	// https://app.prolific.com/submissions/complete?cc=C12FAXR2

	// Format of query params
	// https://chris-letters.vercel.app/?PROLIFIC_PID={{%PROLIFIC_PID%}}&STUDY_ID={{%STUDY_ID%}}&SESSION_ID={{%SESSION_ID%}}

// src/routes/+page.js
import { prolificStore } from '$lib/stores/prolificStore';

export function load({ url }) {
  const PROLIFIC_PID = url.searchParams.get('PROLIFIC_PID');
  const STUDY_ID = url.searchParams.get('STUDY_ID');
  const SESSION_ID = url.searchParams.get('SESSION_ID');

  const params = { PROLIFIC_PID, STUDY_ID, SESSION_ID };

  // directly set the shared store here
  prolificStore.set(params);

  return { prolificParams: params };
}