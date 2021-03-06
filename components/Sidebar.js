import styled from "styled-components";
import { Avatar, IconButton, Button } from "@material-ui/core";
import * as EmailValidator from "email-validator";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import Chat from "../components/Chat";
import AddBoxIcon from "@material-ui/icons/AddBox";

function Sidebar() {
  const [user] = useAuthState(auth);
  const userChatRef = db
    .collection("chats")
    .where("users", "array-contains", user.email);

  const [chatsSnapshop] = useCollection(userChatRef);

  const createChat = async () => {
    const input = prompt(
      "Please enter an email adress for the user you wish to chat with"
    );

    if (!input) return null;

    const usersRef = db.collection("users");
    const usersSnapshot = await usersRef.where("email", "==", input).get();
    if (usersSnapshot.empty) {
      alert("This user is not registered");
      return;
    }

    if (
      !chatAlreadyExists(input) &&
      input !== user.email &&
      EmailValidator.validate(input)
    ) {
      // We need to add the chat into the DB 'chats' collection if it doesnt already exist and is valid
      db.collection("chats").add({
        users: [user.email, input],
      });
    }
  };

  const chatAlreadyExists = (recipientEmail) =>
    !!chatsSnapshop?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );

  const emailText = user.email.split("@")[0];

  return (
    <Container>
      <Header>
        <UserInfoGroup>
          <UserAvatar src={user.photoURL} onClick={() => auth.signOut()} />
          <p>{emailText}</p>
        </UserInfoGroup>
        <IconsContainer>
          <IconButton>
            <AddBoxIcon
              fontSize="large"
              style={{ color: "#000" }}
              onClick={createChat}
            />
          </IconButton>
        </IconsContainer>
      </Header>

      {/* List of Chats */}
      {chatsSnapshop?.docs.map((chat) => (
        <Chat key={chat.id} id={chat.id} users={chat.data().users} />
      ))}
    </Container>
  );
}

export default Sidebar;

const Container = styled.div`
  border-radius: 1px solid whitesmoke;
  min-width: 300px;

  overflow-y: scroll;

  @media (max-width: 1240px) {
    grid-column-start: 1;
    grid-column-end: 4;
    grid-row-start: 1;
    grid-row-end: 3;

    max-width: 100%;
  }

  ::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;

  scrollbar-width: none;
`;

const UserInfoGroup = styled.div`
  > p {
    font-size: 0.8em;
    font-weight: 700;
  }
`;

const Header = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
  cursor: pointer;
  transition: opacity 0.2s linear;

  :hover {
    opacity: 0.8;
  }
`;

const IconsContainer = styled.div``;
