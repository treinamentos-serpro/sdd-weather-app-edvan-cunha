import { normalizeCep } from '../lib/format';

const VIACEP_TIMEOUT_MS = 10_000;

export interface ViaCepLocation {
  city: string;
  stateCode: string;
}

export type ViaCepServiceErrorCode = 'invalid-cep' | 'not-found' | 'unavailable';

export class ViaCepServiceError extends Error {
  constructor(
    message: string,
    public readonly code: ViaCepServiceErrorCode = 'unavailable',
  ) {
    super(message);
    this.name = 'ViaCepServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapLocation(payload: unknown): ViaCepLocation {
  if (!isRecord(payload) || payload.erro === true) {
    throw new ViaCepServiceError('O CEP não foi encontrado no ViaCEP.', 'not-found');
  }

  const city = typeof payload.localidade === 'string' ? payload.localidade.trim() : '';
  const stateCode = typeof payload.uf === 'string' ? payload.uf.trim().toUpperCase() : '';

  if (!city || !stateCode) {
    throw new ViaCepServiceError('O ViaCEP não retornou cidade e UF para este CEP.', 'not-found');
  }

  return { city, stateCode };
}

export async function resolveCep(value: string): Promise<ViaCepLocation> {
  const cep = normalizeCep(value);

  if (!cep) {
    throw new ViaCepServiceError('Informe um CEP válido.', 'invalid-cep');
  }

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = globalThis.setTimeout(() => {
      controller.abort();
      reject(new ViaCepServiceError('A consulta ao ViaCEP excedeu o tempo limite.'));
    }, VIACEP_TIMEOUT_MS);
  });

  const request = async (): Promise<ViaCepLocation> => {
    let response: Response;

    try {
      response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: controller.signal,
      });
    } catch {
      throw new ViaCepServiceError('Não foi possível conectar ao ViaCEP.');
    }

    if (!response.ok) {
      throw new ViaCepServiceError('O ViaCEP retornou uma resposta inválida.');
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      throw new ViaCepServiceError('O ViaCEP retornou uma resposta inválida.');
    }

    return mapLocation(payload);
  };

  try {
    return await Promise.race([request(), timeoutPromise]);
  } catch (error) {
    if (error instanceof ViaCepServiceError) {
      throw error;
    }

    throw new ViaCepServiceError('Não foi possível concluir a consulta ao ViaCEP.');
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
  }
}
