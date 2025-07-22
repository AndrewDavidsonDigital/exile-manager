/**
 * Represents a release version of the application
 */
export interface IIssue {
  /** Version number in semantic versioning format */
  title: string;
  description: string;
  details: string[];
}

export const issues: IIssue[] = [
  {
    title: 'Skill Cap doesn\'t work',
    description: 'There is an implied limit of three active skill slots but this is not actually enforced',
    details: [
      'UI displays n/3 skills, and n can become > 3',
      'Users can enable a 4th or even 5th, etc. skill',
    ],
  },
  {
    title: 'No mobile Buff display',
    description: 'There is no way on the mobile view to be able to understand what buffs are currently active and what effects are applied to you',
    details: [
      'Desktop UI has a hover-tooltip display while mobile doesn\'t',
    ],
  },
]; 