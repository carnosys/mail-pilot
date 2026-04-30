document.addEventListener('DOMContentLoaded', function() {
  const inboxButton = document.querySelector('#inbox');
  const composeButton = document.querySelector('#compose');
  const sentButton = document.querySelector('#sent');
  const archivedButton = document.querySelector('#archived');
  const statusBanner = document.querySelector('#mail-status');
  const emailsView = document.querySelector('#emails-view');
  const composeView = document.querySelector('#compose-view');
  const singleView = document.querySelector('#single-mail-view');
  const form = document.querySelector('#compose-form');

  let activeMailbox = 'inbox';
  let statusTimer = null;

  const mailboxButtons = {
    inbox: inboxButton,
    sent: sentButton,
    archive: archivedButton,
  };

  inboxButton.addEventListener('click', () => load_mailbox('inbox'));
  sentButton.addEventListener('click', () => load_mailbox('sent'));
  archivedButton.addEventListener('click', () => load_mailbox('archive'));
  composeButton.addEventListener('click', compose_email);

  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const recipient = document.querySelector('#compose-recipients').value.trim();
    const subject = document.querySelector('#compose-subject').value.trim();
    const body = document.querySelector('#compose-body').value.trim();

    if (!recipient) {
      showStatus('Add at least one recipient before sending.', 'error');
      document.querySelector('#compose-recipients').focus();
      return;
    }

    if (!subject) {
      showStatus('Add a subject so the message is easier to scan.', 'error');
      document.querySelector('#compose-subject').focus();
      return;
    }

    if (!body) {
      showStatus('Add a message body before sending.', 'error');
      document.querySelector('#compose-body').focus();
      return;
    }

    const response = await fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      showStatus(result.error || 'Unable to send this message.', 'error');
      return;
    }

    showStatus('Message sent.', 'success');
    form.reset();
    load_mailbox('sent');
  });

  load_mailbox('inbox');

  function compose_email() {
    activeMailbox = 'compose';
    setActiveMailbox('compose');
    showSection(composeView);
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    document.querySelector('#compose-recipients').focus();
  }

  function load_mailbox(mailbox) {
    activeMailbox = mailbox;
    setActiveMailbox(mailbox);
    showSection(emailsView);

    emailsView.innerHTML = `
      <div class="mail-list__header">
        <div>
          <p class="section-kicker">Mailbox</p>
          <h2>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h2>
          <p class="section-copy">Recent messages appear here in reverse chronological order.</p>
        </div>
      </div>
      <div class="mail-list" id="mailbox-list"></div>
    `;

    const mailboxList = document.querySelector('#mailbox-list');

    fetch(`emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
        if (!Array.isArray(emails) || emails.length === 0) {
          mailboxList.innerHTML = `
            <div class="mail-empty">
              <div>
                <p class="mail-empty__title">No messages in ${mailbox}.</p>
                <p class="mail-empty__copy">When mail arrives, it will appear here.</p>
              </div>
            </div>
          `;
          return;
        }

        emails.forEach(email => {
          mailboxList.append(createEmailCard(email, mailbox));
        });
      });
  }

  function display_email(emailID) {
    showSection(singleView);

    fetch(`emails/${emailID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ read: true }),
    });

    fetch(`emails/${emailID}`)
      .then(response => response.json())
      .then(email => {
        const sender = document.querySelector('#sender');
        const recipients = document.querySelector('#recipients');
        const subject = document.querySelector('#subject');
        const timestamp = document.querySelector('#timestamp');
        const body = document.querySelector('#body');
        const archiveButton = document.querySelector('#archive-btn');
        const replyButton = document.querySelector('#reply-btn');

        sender.textContent = email.sender;

        recipients.innerHTML = '';
        const recipientList = document.createElement('ul');
        email.recipients.forEach(recipient => {
          const item = document.createElement('li');
          item.textContent = recipient;
          recipientList.append(item);
        });
        recipients.append(recipientList);

        subject.textContent = email.subject || '(No subject)';
        timestamp.textContent = email.timestamp;
        body.textContent = email.body || '';

        replyButton.onclick = () => reply(emailID);

        if (email.archived) {
          archiveButton.textContent = 'Unarchive';
          archiveButton.onclick = () => unarchive(emailID);
        } else {
          archiveButton.textContent = 'Archive';
          archiveButton.onclick = () => archive(emailID);
        }
      });
  }

  function archive(emailID) {
    fetch(`emails/${emailID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archived: true }),
    }).then(() => {
      showStatus('Message archived.', 'success');
      load_mailbox(activeMailbox || 'inbox');
    });
  }

  function unarchive(emailID) {
    fetch(`emails/${emailID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archived: false }),
    }).then(() => {
      showStatus('Message returned to inbox.', 'success');
      load_mailbox(activeMailbox || 'inbox');
    });
  }

  function reply(emailID) {
    fetch(`emails/${emailID}`)
      .then(response => response.json())
      .then(email => {
        const subject = email.subject.trim();
        const sender = email.sender.trim();
        const timeStamp = email.timestamp;
        const body = email.body.trim();

        compose_email();

        document.querySelector('#compose-recipients').value = sender;
        if (!subject.toLowerCase().startsWith('re:')) {
          document.querySelector('#compose-subject').value = `Re: ${subject}`;
        } else {
          document.querySelector('#compose-subject').value = subject;
        }

        document.querySelector('#compose-body').value = `On ${timeStamp} ${sender} wrote:\n${body}`;
      });
  }

  function createEmailCard(email, mailbox) {
    const card = document.createElement('div');
    card.className = 'mail-item';
    if (mailbox === 'inbox' && !email.read) {
      card.classList.add('is-unread');
    }
    card.dataset.id = email.id;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');

    const avatar = document.createElement('div');
    avatar.className = 'mail-item__avatar';
    const avatarSource = mailbox === 'sent' ? email.recipients[0] || email.sender : email.sender;
    avatar.textContent = avatarSource ? avatarSource.charAt(0) : 'M';

    const content = document.createElement('div');
    content.className = 'mail-item__content';

    const top = document.createElement('div');
    top.className = 'mail-item__top';

    const sender = document.createElement('span');
    sender.className = 'mail-item__sender';
    sender.textContent = mailbox === 'sent' ? `To ${email.recipients.join(', ')}` : email.sender;

    const time = document.createElement('span');
    time.className = 'mail-item__time';
    time.textContent = email.timestamp;

    top.append(sender, time);

    const subject = document.createElement('div');
    subject.className = 'mail-item__subject';
    subject.textContent = email.subject || '(No subject)';

    const preview = document.createElement('div');
    preview.className = 'mail-item__preview';
    preview.textContent = previewText(email.body);

    content.append(top, subject, preview);
    card.append(avatar, content);

    card.addEventListener('click', () => display_email(email.id));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        display_email(email.id);
      }
    });

    return card;
  }

  function previewText(body) {
    const text = (body || '').replace(/\s+/g, ' ').trim();
    if (!text) {
      return 'No message preview available.';
    }
    return text.length > 120 ? `${text.slice(0, 120)}…` : text;
  }

  function setActiveMailbox(mailbox) {
    Object.values(mailboxButtons).forEach(button => button.classList.remove('is-active'));
    composeButton.classList.toggle('is-active', mailbox === 'compose');
    if (mailbox && mailboxButtons[mailbox]) {
      mailboxButtons[mailbox].classList.add('is-active');
    }
  }

  function showSection(section) {
    [emailsView, composeView, singleView].forEach(view => {
      view.style.display = 'none';
    });
    section.style.display = 'block';
  }

  function showStatus(message, tone) {
    if (!statusBanner) {
      return;
    }

    window.clearTimeout(statusTimer);
    statusBanner.textContent = message;
    statusBanner.className = `mail-status mail-status--${tone} is-visible`;
    statusTimer = window.setTimeout(() => {
      statusBanner.textContent = '';
      statusBanner.className = 'mail-status';
    }, 3200);
  }
});
