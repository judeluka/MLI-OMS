export const mockContract = {
  id: 'contract-template-2024',
  title: 'Summer Camp Staff Employment Contract',
  version: '2024.1',
  content: `
# EMPLOYMENT CONTRACT - SUMMER CAMP STAFF

**Between:** Irish Summer Adventures Ltd. (Company Registration: 123456)  
**Address:** 45 St. Stephen's Green, Dublin 2, Ireland  

**And:** [STAFF_NAME] (Employee)

## TERMS OF EMPLOYMENT

### 1. Position and Duties
- **Position:** [ROLE_TITLE]
- **Department:** [DEPARTMENT]
- **Start Date:** [START_DATE]
- **End Date:** August 31, 2024
- **Location:** Various camp locations across Ireland

### 2. Salary and Benefits
- **Salary:** €2,500 per month (gross)
- **Payment:** Monthly in arrears
- **Holiday Entitlement:** 4 weeks paid annual leave pro rata
- **Benefits:** Accommodation and meals provided during camp sessions

### 3. Working Hours
- **Standard Hours:** 40 hours per week
- **Camp Sessions:** May include evening and weekend duties
- **Overtime:** Compensated as per company policy

### 4. Responsibilities
As a member of our summer camp team, you will:
- Ensure the safety and wellbeing of all participants
- Deliver high-quality programs in line with our standards
- Maintain professional conduct at all times
- Follow all company policies and procedures
- Participate in training and development activities

### 5. Safeguarding
Given the nature of our work with children and young people:
- You must undergo Garda vetting (Irish police clearance)
- Complete mandatory safeguarding training
- Report any concerns immediately to management
- Adhere to our Child Protection Policy

### 6. Confidentiality
You agree to maintain strict confidentiality regarding:
- Participant information and records
- Company business and operations
- Any sensitive information obtained during employment

### 7. Termination
Either party may terminate this contract with:
- 2 weeks written notice during probationary period (first 3 months)
- 4 weeks written notice thereafter
- Immediate termination for gross misconduct

### 8. Data Protection
We will process your personal data in accordance with GDPR and our Privacy Policy. You have rights regarding your personal data as outlined in our Data Protection Policy.

### 9. Governing Law
This contract is governed by Irish law and subject to the exclusive jurisdiction of Irish courts.

---

**By signing below, you confirm that you have read, understood, and agree to be bound by all terms and conditions of this employment contract.**

**Employee Signature:** _____________________  **Date:** __________

**Company Representative:** _____________________  **Date:** __________  
*Name: Michael O'Sullivan, HR Director*
  `,
  placeholders: {
    '[STAFF_NAME]': 'firstName lastName',
    '[ROLE_TITLE]': 'role',
    '[DEPARTMENT]': 'department', 
    '[START_DATE]': 'startDate'
  },
  lastUpdated: '2024-01-15',
  requiredSignature: true,
  requiredDate: true
}; 