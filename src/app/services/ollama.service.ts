import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { OllamaTagsResponse, OllamaGenerateRequest, OllamaGenerateResponse } from '../models/chat.models';
import { APP_CONFIG } from '../app-config.token';

@Injectable({
  providedIn: 'root'
})
export class OllamaService {
  private readonly baseUrl = 'http://localhost:11434';
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  getModels(): Observable<OllamaTagsResponse> {
    return this.http.get<OllamaTagsResponse>(`${this.baseUrl}/api/tags`);
  }

  generate(request: OllamaGenerateRequest): Observable<OllamaGenerateResponse> {
    return this.http.post<OllamaGenerateResponse>(
      `${this.baseUrl}/api/generate`,
      request
    ).pipe(
      timeout(this.config.modelResponseTimeoutMs)
    );
  }
}
