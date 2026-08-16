import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createAnthropic } from '@ai-sdk/anthropic';
import { EnvironmentVariables } from '../config/environment';

@Injectable()
export class AiProviderService {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  private normalizeBaseUrl(value: string, providerType: string) {
    const url = value.replace(/\/+$/, '');
    if (providerType === 'OPENAI_COMPATIBLE') {
      return url.replace(/\/chat\/completions$/i, '');
    }
    return url.replace(/\/v1\/messages$/i, '');
  }

  configuration() {
    const providerType = this.config.get('AI_DEFAULT_PROVIDER_TYPE', { infer: true });
    const rawBaseUrl = this.config.get('AI_DEFAULT_BASE_URL', { infer: true });
    const apiKey = this.config.get('AI_DEFAULT_API_KEY', { infer: true });
    const modelId = this.config.get('AI_DEFAULT_MODEL_ID', { infer: true });
    return {
      enabled: this.config.get('AI_ENABLED', { infer: true }) === 'true',
      providerType,
      providerName: this.config.get('AI_DEFAULT_PROVIDER_NAME', { infer: true }),
      baseURL: rawBaseUrl ? this.normalizeBaseUrl(rawBaseUrl, providerType) : undefined,
      apiKey,
      modelId,
    };
  }

  resolve() {
    const { baseURL, apiKey, modelId, providerType, providerName: name } =
      this.configuration();
    if (!baseURL || !apiKey || !modelId) {
      throw new ServiceUnavailableException('AI provider is not configured');
    }

    if (providerType === 'ANTHROPIC') {
      const provider = createAnthropic({
        name,
        baseURL,
        apiKey,
      });
      return { model: provider.chat(modelId), modelId };
    }

    const provider = createOpenAICompatible({
      name,
      baseURL,
      apiKey,
      headers:
        name.toLowerCase() === 'openrouter'
          ? {
              'HTTP-Referer': this.config.get('FRONTEND_URL', { infer: true }),
              'X-Title': 'Shelta CRM',
            }
          : undefined,
    });
    return { model: provider.chatModel(modelId), modelId };
  }
}
