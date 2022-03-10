document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#showemail-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

  // Submitting the email
    document.querySelector('form').onsubmit = function () {
        const ricipients = document.querySelector('#compose-recipients').value;
        const subject = document.querySelector('#compose-subject').value;
        const body = document.querySelector('#compose-body').value;
        const maildata = {
            recipients: ricipients,
            subject: subject,
            body: body
        };
        const options = {
            method: 'POST',
            body: JSON.stringify(maildata),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        fetch('/emails', options)
            .then(response => response.json())
            .then(result => {
                // Print result
                console.log("good");
                if ("message" in result) {
                    load_mailbox("sent");
                } 
            });
        return false
    }
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#showemail-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    console.log(mailbox)
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`
    fetch(`emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            emails.forEach((element) => {
                var item = document.createElement("div");
                item.className = `card mb-3`;
                item.style = "background-image: linear-gradient(to bottom left,rgb(34, 22, 90),rgb(0, 0, 0));border-radius:7em;padding-left :2em;padding-right:2em;border:4px solid black;";
                item.innerHTML = `<a onclick="show_email(${element.id})"><div class="card-body" id="item-${element.id}">
                <p class="float-right text-light "> ${element.timestamp}</p>
                <p><strong>From : </strong> ${element.sender}</br><strong>Subject : </strong>${element.subject}</br>
                ${element.body.slice(0, 50)}
                ...</div></a>`;
                if (element.read === false) {
                    item.style = "background-image: linear-gradient(to bottom left,rgb(34, 22, 90),rgb(0, 0, 0));border-radius:7em;padding-left :2em;padding-right:2em;border:4px solid blue;";
                }
                document.querySelector("#emails-view").appendChild(item);
            });
        });
    }

function show_email(emailid) {
    //Show email and hide all other view
    document.querySelector('#showemail-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    console.log(emailid)
    var user = document.getElementById('username').value
    fetch(`/emails/${emailid}`)
        .then(response => response.json())
        .then(email => {
            // Print email
            console.log(email);
            document.querySelector("#showemail-view").innerHTML = `<div class="card-header">
            <strong>From :</strong> ${email.sender}</br>
            <strong>Recipients :</strong> ${user}</br>
            <strong>Subject :</strong> ${email.subject}</br>
            <strong>Sent on :</strong>${email.timestamp}</br>
            <input type="hidden" value="${email.id}" name="value" id='reply' />
            <input class="btn btn-sm btn-outline-primary" type="button" value="Reply" onclick="reply_email()" />
            </div>
            <div class="card-body" id="item-${email.id}">
            <strong>Body :</strong>
                <br>
               <i> ${email.body}</i>
                </div>`;
            mark_seen(`${emailid}`);
            if (email.archived == true) {
                var buttons = document.createElement('div')
                buttons.innerHTML = ` <input type="hidden" value="${email.id}" name="value" id='archive' />
               <button class="btn btn-sm btn-outline-primary" value="Unarchive" onclick="unarchive()">Unarchive</button>`
                document.getElementById("showemail-view").appendChild(buttons);
            } else {
                var buttons = document.createElement('div')
                buttons.innerHTML = ` <input type="hidden" value="${email.id}" name="value" id='archive' />
               </br><button class="btn btn-sm btn-outline-primary" value="Archive" onclick="make_archive()"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-archive" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
</svg> Archive</button>`
                document.getElementById("showemail-view").appendChild(buttons);
            }
        });
}
function make_archive() {
    var id = document.getElementById('archive').value
    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
    })
    load_mailbox('inbox');
}
function unarchive() {
    var id = document.getElementById('archive').value
    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
    })
    load_mailbox('inbox');
}
function mark_seen(emailid) {
    fetch(`/emails/${emailid}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })
}
function reply_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#showemail-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    var id = document.getElementById('reply').value
    var user = document.getElementById('username').value
    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
            // Print email
            console.log(email);
            document.querySelector('#compose-recipients').value = email.sender;
            document.querySelector('#compose-recipients').disabled = true;
            if (email.subject.search("Re:") == "-1") {
                document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
            } else {
                document.querySelector('#compose-subject').value = email.subject;
            }
            document.querySelector('#compose-subject').disabled = true;
            document.querySelector('#compose-body').value = `On ${email.timestamp} ,${user} Wrote :`;
        });
    // Submitting the email
    document.querySelector('form').onsubmit = function () {
        const ricipients = document.querySelector('#compose-recipients').value;
        const subject = document.querySelector('#compose-subject').value;
        const body = document.querySelector('#compose-body').value;
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: ricipients,
                subject: subject,
                body: body
            })
        })
            .then(response => response.json())
            .then(result => {
                // Print ssuccess
                console.log(result);
            });
    };
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}