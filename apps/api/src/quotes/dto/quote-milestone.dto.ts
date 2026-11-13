import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class QuoteMilestoneDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  percentage?: number; // e.g. 30 for 30%

  @IsString()
  @IsOptional()
  amountMinor?: string; // integer minor units as string

  @IsString()
  @IsOptional()
  dueDate?: string;
}

export const MILESTONE_PRESETS: Record<string, { title: string; percentage: number; description: string }[]> = {
  '30/40/30': [
    {
      title: 'Advance Mobilization & Kickoff',
      percentage: 30,
      description: 'Due upon contract signing and project environment provisioning.',
    },
    {
      title: 'Core Deliverables & User Acceptance (UAT)',
      percentage: 40,
      description: 'Due upon delivery and client sign-off of core milestone features.',
    },
    {
      title: 'Final Handover & Production Go-Live',
      percentage: 30,
      description: 'Due upon deployment to production and final asset/code handover.',
    },
  ],
  '50/50': [
    {
      title: 'Initial Deposit',
      percentage: 50,
      description: 'Due upon contract signing and project initiation.',
    },
    {
      title: 'Final Delivery & Sign-Off',
      percentage: 50,
      description: 'Due upon complete delivery and production sign-off.',
    },
  ],
  '25/25/25/25': [
    {
      title: 'Phase 1: Architecture & Design',
      percentage: 25,
      description: 'System specifications and architecture design approval.',
    },
    {
      title: 'Phase 2: Alpha Development',
      percentage: 25,
      description: 'Functional alpha release with core workflows.',
    },
    {
      title: 'Phase 3: Beta & User Acceptance',
      percentage: 25,
      description: 'Feature-complete build tested and validated in staging.',
    },
    {
      title: 'Phase 4: Production Handover',
      percentage: 25,
      description: 'Production deployment, documentation, and handover.',
    },
  ],
  '100': [
    {
      title: 'Full Upfront Payment',
      percentage: 100,
      description: '100% full payment due upon contract signing.',
    },
  ],
};
