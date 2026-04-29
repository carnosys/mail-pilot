  document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    const form = document.querySelector('#compose-form')

    form.addEventListener('submit', function(event){
      event.preventDefault();

      const recipient = document.querySelector('#compose-recipients').value
      const subject = document.querySelector('#compose-subject').value
      const body = document.querySelector("#compose-body").value

      let is_valid = true 

      if (recipient==""){
        alert("receipent field cannot be empty");
        document.querySelector('#compose-recipients').value="";
        is_valid=false

      }

      if (subject==""){
        alert("subject field cannot be empty");
        document.querySelector('#compose-subject').value="";
        is_valid=false

      }

      if (body==""){
        alert("bodyt field cannot be empty");
        document.querySelector('#compose-body').value="";
        is_valid=false

      }

      if (is_valid==true){
        fetch("/emails",{
          method:"POST",
          body: JSON.stringify(
            {
              recipients:`${recipient}`,
              subject:  `${subject}`,
              body: `${body}`
            }
          )
        }).then(response=>response.json()).then(result=>{console.log(result)
          alert("Email Sent Succesfully")
          form.reset()
          load_mailbox("sent")
        })
      }

    })

    // By default, load the inbox
    load_mailbox('inbox');
  });

  function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#single-mail-view').style.display = 'none';


    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    
  }

  function load_mailbox(mailbox) {
    
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-mail-view').style.display = 'none';

    

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    fetch( `emails/${mailbox}`).then(response=>response.json()).then(emails=>{
      emails.forEach(email=>{
        const emailElement = document.createElement('div')
      
        emailElement.dataset.id = email.id

        const sender=document.createElement('span')
        const subject = document.createElement('span')
        const time_stamp = document.createElement('span')

        emailElement.append(sender);
        emailElement.append(subject);
        emailElement.append(time_stamp);

        sender.innerHTML=`Sender: ${email.sender}`
        subject.innerHTML=`Subject: ${email.subject}`
        time_stamp.innerHTML=`Sent: ${email.timestamp}`

        



        document.querySelector('#emails-view').append(emailElement)

        for (const child of emailElement.children){

          child.classList.add("email-field")
        

        }


        emailElement.classList.add('email')
        emailElement.addEventListener("click",display_email)
       
        if(mailbox=="inbox")
        if(email.read){
          emailElement.style.backgroundColor="lightgray" 
        }
      })
      

    })
    
  }

  function display_email(event)
  {
    

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-mail-view').style.display = 'block';
    const emailID = event.currentTarget.dataset.id

    fetch(`emails/${emailID}`, {
      method:"PUT",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({read:true})
    })

    
    fetch(`emails/${emailID}`).then(response=>response.json()).then(email=>{
      const element = document.querySelector("#single-mail-view")

      document.querySelector("#sender").innerHTML= `<h3>${email.sender}</h3>`
      
      let receipenthtml = "<ul>"
      for (recipient of email.recipients){
        receipenthtml +=`<li>${recipient}</li>`
      }
      
      receipenthtml += "</ul>"

      document.querySelector("#recipients").innerHTML=receipenthtml


      document.querySelector("#subject").innerHTML=`<h3>${email.subject}</h3>`
      document.querySelector("#body").innerHTML= `<p>${email.body}</p>`

      document.querySelector("#reply-btn").onclick= () =>reply(emailID)

      if(email.archived)
      {
       document.querySelector("#archive-btn").innerHTML="Unarchive" 
       document.querySelector("#archive-btn").onclick = () => unarchive(emailID)

      }
      else
      {
         document.querySelector("#archive-btn").innerHTML="Archive"
       document.querySelector("#archive-btn").onclick = () => archive(emailID)
      }
    
    }) 
  }

  function archive(emailID){
    fetch(`emails/${emailID}`,{
      method:"PUT",
      headers:{
        "Content-Type": "application/json"
      },

      body:JSON.stringify({archived:true})
    })
     alert("Email succesfully archived")
     load_mailbox("inbox")
     
  }

  function unarchive(emailID){
    fetch(`emails/${emailID}`,{
      method:"PUT",
      headers:{
        "Content-Type": "application/json"
      },

      body:JSON.stringify({archived:false})
    })
     alert("Email succesfully uarchived")
    load_mailbox("inbox")
    
  }

  function reply(emailID){

    fetch(`emails/${emailID}`).then(response=>response.json()).then(email=>{
      const subject = email.subject.trim()
      const sender = email.sender.trim()
      const time_stamp= email.timestamp
      const body=email.body.trim()

      compose_email()

      document.querySelector('#compose-recipients').value = `${sender}`;
      if(!subject.toLowerCase().startsWith("re:"))
      document.querySelector('#compose-subject').value = `Re:${subject}`;
      else
      document.querySelector('#compose-subject').value = `${subject}`;  

      document.querySelector('#compose-body').value = `On ${time_stamp} ${sender} wrote: ${body}`;
    })
    
  }