# The Impact of Message Framing in Physical Activity (Bachelor's Thesis)

## Overview
In this project, I aimed to understand the impact of message framing on physical activity levels. To do this, I sent 2 different types of emails: positive, negative, (and also included a control group with no emails), and measured the difference in activity levels over a span of a month. In the end, no significant results were found, although I believe this reflects on the nature of the intervention rather than the overall effectivity of message framing.

## Methods
- Describe the research design (e.g., survey, experiment, field study).
- Tools used (e.g., Python for data analysis, R, Qualtrics for surveys).
- Data collection and sample details (ensuring privacy/anonymization).

## Mathematical model and Thesis

In essence the idea behind the model is as follows. We used a moderation model, where the type of message (positive, negative, or control) was the independent variable, self-efficacy and attitudes towards physical activity were moderators, and the difference in physical activity over a period of a month was the dependent variable. In a flow chart, we can visualize this as

``` mermaid
graph LR
  D{Self-Efficay} -->|β| B;
  A --> X((( )));
  D --> X;
  X --> |δ| B
  A[Message Framing] --> |α| B[Change in Physical Activity];
  A --> Y((( )));
  E --> Y;
  Y --> |ε| B;
  E{Attitudes} --> |γ| B;
```
In particular, naming message framing as $X$, the the moderators $M_1$ and $M_2$ for self-efficacy and attitudes respectively, and $Y$ for the change in physical activity, the model takes the form 

$$Y = c+ \alpha X + \beta M_1 + \gamma M_2 + \delta X \cdot M_1 + \varepsilon X \cdot M_2$$

for which I used a simple regression to find the optimum coefficients $c, \alpha, \beta, \gamma,\delta, \varepsilon$. (Some extra work was needed as $X$ is really a categorical variable, and so it was encoded into dummy variables)


Here you can find my complete thesis.
 <iframe src="../../assets/Bachelor_Thesis.pdf" width="90%" height="500px" style="border: none;"></iframe>

## Supplementary Code
I needed coding for two main purposes: for the data analysis of the .csv files, and for the automatization of the emails. In particular, the code that I needed to run every day took care of:
* Update my csv file with users, writing down how many days deep in the interview each user was and identifying what are the resepctive procedures that needed to be implemented. 
* If a user finished the intervention (participated for over 30 days) remove them from the email list and place them in a different file to be used for the final survey
* Else, check to which group the specific user belonged to and assign a message. A message was sent to a user every 3 days since they started the intervention, and it could be either gain-framing, loss-framing, or no message (if in control group)
* Send the emails

```python
import smtplib
import pandas as pd
import random
from email.mime.text import MIMEText
from datetime import datetime
from dataclasses import dataclass
from typing import List
##  First define the macros SEND_EMAILS, INIT_SURVEY_PATH, FINAL_SURVEY_PATH,EMAILS_AND_GROUPS_PATH, OVER_30_PATH, SENDER, PASSWORD 

@dataclass
class EmailObj:
    email: str
    subject: str
    body: str


def extract_subjects_and_bodies()-> tuple:
    """Extracts the subjects and bodies from the .txt 
    files and returns them as lists of strings.

    Returns:
        tuple: (subjects_text, bodies_text)
        With both being lists of 3 lists of 31 strings 
    """
    subjects_text = [[], [], []]
    bodies_text = [[], [], []]
    for group_num in range(3):
        
        with open(f'subjects_group_{group_num+1}.txt', 'r') as file:
            for line in file:
                # Append each line (recipient) to the recipients list, removing leading/trailing whitespace
                subjects_text[group_num].append(line.strip())
        
        with open(f'body_group_{group_num+1}.txt', 'r') as file:
            for line in file:
                bodies_text[group_num].append(line.strip())

    return subjects_text, bodies_text


def match_emails_to_person() -> List[EmailObj]:
    """Match the emails to the subjects and bodies corresponding to them 
    depending on the group number and the number of days since the survey was filled.

    Returns:
        List[EmailObj]: list of EmailObj objects, for each entry in EMAILS_AND_GROUPS_PATH file
    """
    subjects_text, bodies_text = extract_subjects_and_bodies()
    emails_groups_df = pd.read_csv(EMAILS_AND_GROUPS_PATH)
    emailObjects = []
    for _, row in emails_groups_df.iterrows():
        email = row['Email Address']
        group_number = row['Group Number']
        date = row['Timestamp']
        date = datetime.strptime(date, '%m/%d/%Y %H:%M:%S')
        num_days = (datetime.now() - date).days
        subject = subjects_text[group_number-1][num_days]
        body = bodies_text[group_number-1][num_days]
        if email == "snmendozav@gmail.com":
            print(f"Email: {email}, Group: {group_number}, Days: {num_days}", subject)
        # print(f"Email: {email}, Group: {group_number}, Days: {num_days}, Subject: {subject}, Body: {body}")
        if subject == "" or body == "":
            continue
        emailObjects.append(EmailObj(email, subject, body))
    return emailObjects


def send_email(emailObjects: EmailObj, sender: str, password: str):
    """Send an email to the recipients in the emailObjects list

    Args:
        emailObjects (EmailObj): EmailObj object to be sent in the email
        sender (str): Email address of the sender
        password (str): Password of the sender's email

    Returns:
        None: No return value
    """
    for emailObject in emailObjects:
        recipient = emailObject.email
        subject = emailObject.subject
        body = emailObject.body
        msg = MIMEText(body, 'html')
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = ', '.join(recipient)
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
            smtp_server.login(sender, password)
            smtp_server.sendmail(sender, recipient, msg.as_string())
            # print("Message sent!")
    return None


def update_emails_and_groups() -> None:
    """Updates the emails_and_groups.csv file by adding the
    emails that are in the FINAL_SURVEY_PATH file

    Returns:
        None: No return value
    """
    init_survey_df = pd.read_csv(INIT_SURVEY_PATH)
    emails_groups_df = pd.read_csv(EMAILS_AND_GROUPS_PATH)
    final_survey_df = pd.read_csv(FINAL_SURVEY_PATH)
    over_30_df = pd.read_csv(OVER_30_PATH)
    
    # Iterate over the "Email Address" column in survey.csv
    for _, row in init_survey_df.iterrows():
        email = row['Email Address']
        init_time = row['Timestamp']
        # Check if the email exists in emails_and_groups.csv
        if email not in emails_groups_df['Email Address'].values\
            and email not in final_survey_df['Email Address'].values\
                and email not in over_30_df['Email Address'].values:
            # Generate a random group number between 1 and 3
            group_number = int(random.randint(1, 3))
            date = row['Timestamp']
            date = datetime.strptime(date, '%m/%d/%Y %H:%M:%S')
            num_days = int((datetime.now() - date).days)
            # Add a new row to emails_and_groups_df
            new_row = {'Email Address': email,
                       'Timestamp': init_time,
                       'Group Number': group_number,
                       'Number of Days': num_days}
            emails_groups_df = pd.concat([emails_groups_df, pd.DataFrame([new_row])], ignore_index=True)
    emails_groups_df.to_csv(EMAILS_AND_GROUPS_PATH, index=False)
    return None


def find_over_30_days():
    """Finds the emails that have been in the EMAILS_AND_GROUPS_PATH
    file for over 30 days. Then removes them and reallocates them into the 
    OVER_30_PATH file.

    Returns:
        None: No return value
    """
    emails_groups_df = pd.read_csv(EMAILS_AND_GROUPS_PATH)
    over_30_df = pd.read_csv(OVER_30_PATH)
    for idx, row in emails_groups_df.iterrows():
        num_days = row['Number of Days']
        if num_days > 32 and row['Email Address'] not in over_30_df['Email Address'].values:
            newrow = {'Email Address': row['Email Address'],
                      "Timestamp": row["Timestamp"], 'Group Number': row['Group Number']}
            over_30_df = pd.concat([over_30_df, pd.DataFrame([newrow])], ignore_index=True)
            emails_groups_df.drop(idx, inplace=True)
    over_30_df.to_csv(OVER_30_PATH, index=False)
    emails_groups_df.to_csv(EMAILS_AND_GROUPS_PATH, index=False)
    return None


def find_filled_final_survey():
    """Finds the emails that have filled the final survey and removes them
    from the OVER_30_PATH file. Then sends them an email with the final survey link
    to those that have not filled out the final survey and are in the OVER_30_PATH file.

    Returns:
        None: No return value
    """
    over_30_df = pd.read_csv(OVER_30_PATH)
    final_survey_df = pd.read_csv(FINAL_SURVEY_PATH)
    for idx, row in over_30_df.iterrows():
        email = row['Email Address']
        if email in final_survey_df['Email Address'].values:
            over_30_df.drop(idx, inplace=True)

        else: 
            subject = "Final Step!"
            body = "Congratulations, you are almost there! To finalize this study (and participate in the raffle for the prize), please complete the following short survey: https://forms.gle/gSwfwrJHFtMmsMZC8\n\n Thank you for your participation!"
            if SEND_EMAILS:
                send_email([EmailObj(email, subject, body)], SENDER, PASSWORD)
            else:
                print("Sending email to: ", email)
                # print("Subject: ", subject)
                # print("Body: ", body)
            
    final_survey_df.to_csv(FINAL_SURVEY_PATH, index=False)
    over_30_df.to_csv(OVER_30_PATH, index=False) 
    return None
            

def daily_process():
    """The process that needs to be run every day
    """
    # Update all the .csv files
    update_emails_and_groups()
    find_over_30_days()
    find_filled_final_survey()
    
    # Match the emails to the subjects and bodies corresponding to them
    emailObjects = match_emails_to_person()
    # Send the emails
    if SEND_EMAILS: 
        send_email(emailObjects, SENDER, PASSWORD)
    else: 
        for emailObj in emailObjects:
            print("Sending email to: ", emailObj.email)

```

This automatization was needed, as the sample size was large enough to make it unfeasable to send each email individually. 

## Results
Summarize findings and their implications. Explain how results informed decisions or further research.

## Impact
My results highlight that using emails as an intervention system was not an effective technique. Indeed, the participants which received negative and positive framing exhibited no statistically significant difference in activity levels from the control group. This should be considered in further interventions, and perhaps other methodologies (like mobile applications) should be adopted. In particular, it is a step forward in understanding what type of behavioural interventions should be used to make an impact in the activity levels of students.

## Next Steps & Reflections
What could be improved, follow-up studies, lessons learned.
