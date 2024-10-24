[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/e0mOS4g_)
# Superjoin Hiring Assignment

### Welcome to Superjoin's hiring assignment! 🚀

### Objective
Build a solution that enables real-time synchronization of data between a Google Sheet and a specified database (e.g., MySQL, PostgreSQL). The solution should detect changes in the Google Sheet and update the database accordingly, and vice versa.

### Problem Statement
Many businesses use Google Sheets for collaborative data management and databases for more robust and scalable data storage. However, keeping the data synchronised between Google Sheets and databases is often a manual and error-prone process. Your task is to develop a solution that automates this synchronisation, ensuring that changes in one are reflected in the other in real-time.

### Requirements:
1. Real-time Synchronisation
  - Implement a system that detects changes in Google Sheets and updates the database accordingly.
   - Similarly, detect changes in the database and update the Google Sheet.
  2.	CRUD Operations
   - Ensure the system supports Create, Read, Update, and Delete operations for both Google Sheets and the database.
   - Maintain data consistency across both platforms.
   
### Optional Challenges (This is not mandatory):
1. Conflict Handling
- Develop a strategy to handle conflicts that may arise when changes are made simultaneously in both Google Sheets and the database.
- Provide options for conflict resolution (e.g., last write wins, user-defined rules).
    
2. Scalability: 	
- Ensure the solution can handle large datasets and high-frequency updates without performance degradation.
- Optimize for scalability and efficiency.

## Submission ⏰
The timeline for this submission is: **Next 2 days**

Some things you might want to take care of:
- Make use of git and commit your steps!
- Use good coding practices.
- Write beautiful and readable code. Well-written code is nothing less than a work of art.
- Use semantic variable naming.
- Your code should be organized well in files and folders which is easy to figure out.
- If there is something happening in your code that is not very intuitive, add some comments.
- Add to this README at the bottom explaining your approach (brownie points 😋)
- Use ChatGPT4o/o1/Github Co-pilot, anything that accelerates how you work 💪🏽. 

Make sure you finish the assignment a little earlier than this so you have time to make any final changes.

Once you're done, make sure you **record a video** showing your project working. The video should **NOT** be longer than 120 seconds. While you record the video, tell us about your biggest blocker, and how you overcame it! Don't be shy, talk us through, we'd love that.

We have a checklist at the bottom of this README file, which you should update as your progress with your assignment. It will help us evaluate your project.

- [ ] My code's working just fine! 🥳
- [ ] I have recorded a video showing it working and embedded it in the README ▶️
- [ ] I have tested all the normal working cases 😎
- [ ] I have even solved some edge cases (brownie points) 💪
- [ ] I added my very planned-out approach to the problem at the end of this README 📜

## Got Questions❓
Feel free to check the discussions tab, you might get some help there. Check out that tab before reaching out to us. Also, did you know, the internet is a great place to explore? 😛

We're available at techhiring@superjoin.ai for all queries. 

All the best ✨.

## Developer's Section
*Add your video here, and your approach to the problem (optional). Leave some comments for us here if you want, we will be reading this :)*

### Video 

### Diagram 

### Approach to the Problem

The main strategy I used was leveraging `onEdit` triggers in Google Sheets to instantly send any changes to the backend, rather than relying on polling. Polling can be inefficient because it constantly checks for updates at fixed intervals, which wastes resources and slows things down. The `onEdit` trigger in Google Sheets pushes changes as soon as they happen, and since it has built-in debouncing, it prevents unnecessary repeated triggers, which is a huge win in terms of efficiency.

On the PostgreSQL side, I incorporated **notification triggers** to handle data changes. Whenever something changes in the database, these triggers notify the backend, so there’s no need for constant polling on that end either. This makes syncing way more efficient and responsive.

#### Infrastructure and Scaling
The PostgreSQL instance is hosted on AWS, which helps with scaling and ensures better performance as the data or traffic increases. Hosting on AWS gives the flexibility to scale the database resources as needed while maintaining high availability and reliability.

#### Conflict Detection and Resolution
I also implemented **conflict detection and resolution** strategies to handle simultaneous edits on both platforms. A key part of this is the use of a flagged column. If a change is made from Google Sheets, it won’t trigger the notification to update Google Sheets again. This effectively prevents duplicate entries or unnecessary loops when syncing between platforms.

#### Efficient Data Handling
To ensure efficiency, especially when dealing with larger datasets, I used **batch processing** when sending data back to PostgreSQL. This helps avoid hitting Google Sheets API rate limits and ensures smoother operations when handling multiple changes at once.

#### Security and Monitoring
I also focused on security by using secure API authentication between Google Sheets and the backend. This keeps the data protected and prevents unauthorized access. For better transparency and easier troubleshooting, I added logging on both ends, which helps track activities in real-time and flags any issues or unexpected behaviors.

#### Lesson Learned: Ngrok to the Rescue!
I was stuck when I couldn't send the payload from Google Apps Script to my localhost, but then I discovered Ngrok. It creates a secure tunnel from the internet to your local machine, allowing you to expose your localhost to the web. This was super helpful for testing and debugging. I’m confident I’ll use this learning in future projects.