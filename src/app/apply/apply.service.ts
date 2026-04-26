import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApplyService {

  // FIX #6: Use environment.apiUrl instead of hardcoded localhost
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  submitApplication(
    formData: any,
    educationList: any[],
    experienceList: any[],
    selectedJob: any,
    cvFile: File,
    idFile: File
  ): Observable<any> {

    const payload = {
      fullName: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      nationality: formData.nationality,
      idNumber: formData.id_number,
      hasDisability: formData.has_disability,
      disabilityDetails: formData.disability_details,
      jobTitle: selectedJob?.title || '',
      jobCompany: selectedJob?.company || '',
      jobLocation: selectedJob?.location || '',
      educationList,
      experienceList
    };

    const body = new FormData();
    const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    body.append('data', jsonBlob);

    if (cvFile) body.append('cv', cvFile);
    if (idFile) body.append('id', idFile);

    return this.http.post(this.apiUrl, body);
  }
}
