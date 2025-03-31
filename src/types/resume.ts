export interface Resume {
   // id: string;
   // user_id: string;
   // original_filename: string;
   // upload_date: string;
   // email: string;
   // phone_number: string;
   // address: string;

    skills: string[];
    experiences: Array<{
      company: string;
      position: string;
      date_start: string;
      date_end: string;
      description: string;
    }>;
    education: Array<{
      school: string;
      degree: string;
      date_start: string;
      date_end: string;
    }>;
    languages: string[];
    strengths: string[];
    improvement_axes: string[];
    potential_jobs: Array<{string: string}>;
  }