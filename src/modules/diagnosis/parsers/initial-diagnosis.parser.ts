import { Injectable } from '@nestjs/common';

import {
  InitialDiagnosisCause,
  InitialDiagnosisResult,
  RepairPreview,
} from '../interfaces/initial-diagnosis-result.interface';

export class InitialDiagnosisParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = InitialDiagnosisParseError.name;
  }
}

@Injectable()
export class InitialDiagnosisParser {
  parse(content: string): InitialDiagnosisResult {
    const data = this.parseJson(content);

    if (!this.isRecord(data)) {
      throw new InitialDiagnosisParseError('AI response must be a JSON object');
    }

    return {
      summary: this.readString(data.summary, 'summary'),
      estimatedMinutes: this.readPositiveInteger(
        data.estimatedMinutes,
        'estimatedMinutes',
      ),
      causes: this.parseCauses(data.causes),
      repairPreview: this.parseRepairPreview(data.repairPreview),
    };
  }

  private parseJson(content: string): unknown {
    if (typeof content !== 'string' || !content.trim()) {
      throw new InitialDiagnosisParseError('AI response must not be empty');
    }

    const json = this.removeMarkdownFence(content);

    try {
      return JSON.parse(json) as unknown;
    } catch {
      throw new InitialDiagnosisParseError('AI response contains invalid JSON');
    }
  }

  private removeMarkdownFence(content: string): string {
    const trimmed = content.trim();

    const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

    return match ? match[1].trim() : trimmed;
  }

  private parseCauses(value: unknown): InitialDiagnosisCause[] {
    if (!Array.isArray(value)) {
      throw new InitialDiagnosisParseError('causes must be an array');
    }

    if (value.length < 2 || value.length > 5) {
      throw new InitialDiagnosisParseError(
        'causes must contain between 2 and 5 items',
      );
    }

    return value.map((item: unknown, index: number) => {
      const field = `causes[${index}]`;

      if (!this.isRecord(item)) {
        throw new InitialDiagnosisParseError(`${field} must be an object`);
      }

      return {
        name: this.readString(item.name, `${field}.name`),
        description: this.readString(item.description, `${field}.description`),
        probability: this.readProbability(
          item.probability,
          `${field}.probability`,
        ),
        estimatedMinutes: this.readPositiveInteger(
          item.estimatedMinutes,
          `${field}.estimatedMinutes`,
        ),
      };
    });
  }

  private parseRepairPreview(value: unknown): RepairPreview {
    if (!this.isRecord(value)) {
      throw new InitialDiagnosisParseError('repairPreview must be an object');
    }

    if (
      !Array.isArray(value.likelyActions) ||
      value.likelyActions.length === 0
    ) {
      throw new InitialDiagnosisParseError(
        'repairPreview.likelyActions must be a non-empty array',
      );
    }

    return {
      summary: this.readString(value.summary, 'repairPreview.summary'),
      likelyActions: value.likelyActions.map((action: unknown, index: number) =>
        this.readString(action, `repairPreview.likelyActions[${index}]`),
      ),
    };
  }

  private readString(value: unknown, field: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new InitialDiagnosisParseError(
        `${field} must be a non-empty string`,
      );
    }

    return value.trim();
  }

  private readPositiveInteger(value: unknown, field: string): number {
    if (
      typeof value !== 'number' ||
      !Number.isSafeInteger(value) ||
      value <= 0
    ) {
      throw new InitialDiagnosisParseError(
        `${field} must be a positive integer`,
      );
    }

    return value;
  }

  private readProbability(value: unknown, field: string): number {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 1
    ) {
      throw new InitialDiagnosisParseError(
        `${field} must be a number between 0 and 1`,
      );
    }

    return value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
