export const onboardingSteps = [
  {
    id: 'personal-profile',
    title: 'Complete Personal Profile',
    description: 'Provide your personal information and contact details',
    order: 1,
    requiredFields: [
      'firstName',
      'lastName',
      'dateOfBirth',
      'phoneNumber',
      'address',
      'emergencyContact',
      'bankDetails'
    ],
    estimatedTime: '10 minutes'
  },
  {
    id: 'contract-review',
    title: 'Review & Sign Contract',
    description: 'Review your employment contract and provide digital signature',
    order: 2,
    requiredFields: ['digitalSignature', 'signatureDate'],
    estimatedTime: '15 minutes'
  },
  {
    id: 'document-upload',
    title: 'Upload Required Documents',
    description: 'Upload identification and other required documentation',
    order: 3,
    requiredFields: ['passport', 'proofOfAddress', 'rightToWork'],
    estimatedTime: '5 minutes'
  },
  {
    id: 'policies-review',
    title: 'Review Company Policies',
    description: 'Read and acknowledge key company policies and handbook',
    order: 4,
    requiredFields: ['codeOfConduct', 'dataProtection', 'healthSafety', 'itUsage', 'employeeHandbook'],
    estimatedTime: '20 minutes'
  },
  {
    id: 'role-information',
    title: 'Role & Team Information',
    description: 'Learn about your role, team, and initial responsibilities',
    order: 5,
    requiredFields: ['roleAcknowledgment'],
    estimatedTime: '5 minutes'
  }
];

export const requiredDocuments = [
  {
    id: 'passport',
    name: 'Passport/ID Copy',
    description: 'Clear copy of your passport or national ID',
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: '5MB',
    required: true
  },
  {
    id: 'proofOfAddress',
    name: 'Proof of Address',
    description: 'Utility bill or bank statement from the last 3 months',
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: '5MB',
    required: true
  },
  {
    id: 'rightToWork',
    name: 'Right to Work Documentation',
    description: 'Documentation proving your right to work in Ireland',
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: '5MB',
    required: true
  }
];

export const companyPolicies = [
  {
    id: 'codeOfConduct',
    title: 'Code of Conduct',
    description: 'Our standards for professional behavior and ethics',
    content: `
# Code of Conduct

## Professional Standards
All staff members are expected to maintain the highest standards of professionalism...

## Child Protection
As an organization working with children, we have strict safeguarding policies...

## Equal Opportunities
We are committed to providing equal opportunities for all staff and campers...
    `,
    required: true
  },
  {
    id: 'dataProtection',
    title: 'Data Protection Policy',
    description: 'How we handle personal data in compliance with GDPR',
    content: `
# Data Protection Policy

## Overview
This policy explains how we collect, use, and protect personal data...

## Your Rights
Under GDPR, you have the right to access, correct, and delete your data...
    `,
    required: true
  },
  {
    id: 'healthSafety',
    title: 'Health & Safety Policy',
    description: 'Important safety procedures and emergency protocols',
    content: `
# Health & Safety Policy

## Emergency Procedures
In case of emergency, follow these procedures...

## Risk Assessment
All activities must be risk assessed before implementation...
    `,
    required: true
  },
  {
    id: 'itUsage',
    title: 'IT Usage Policy',
    description: 'Guidelines for using company technology and systems',
    content: `
# IT Usage Policy

## Acceptable Use
Company technology should be used for business purposes...

## Security Requirements
All devices must be password protected and encrypted...
    `,
    required: true
  },
  {
    id: 'employeeHandbook',
    title: 'Employee Handbook',
    description: 'Comprehensive guide to working at our summer camp',
    content: `
# Employee Handbook

## Welcome
Welcome to our team! This handbook contains everything you need to know...

## Company Culture
We believe in creating magical experiences for children...
    `,
    required: true
  }
]; 