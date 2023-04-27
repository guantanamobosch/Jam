import { Link } from "react-router-dom";
import * as userService from "../../utilities/users/users-service";
import "./NavBar.css";
import homeIcon from "../../images/icons/homeIcon.png";
import chatIcon from "../../images/icons/chatIcon.png";
import notificationIcon from "../../images/icons/notiBellIcon.png";
import ProfilePicture from "../../images/icons/profilepicdemo.png";

export default function NavBar({ user, setUser, jars }) {
    function handleLogOut() {
        userService.logOut();
        setUser(null);
    }

    return (
        <div className="navBar">
            <nav>
                <ul className="squircles">
                    <li className="squircle white-one"></li>
                    <li className="divider"></li>
                    {jars.map((jar) => {
                        return (
                            <li className="squircle purple-one">
                                <div className="popup">
                                    <h4 className="popup-text">{jar.name}</h4>
                                </div>
                            </li>
                        );
                    })}
                    <li className="squircle purple-one">
                        <div className="popup">
                            <h4 className="popup-text">JAM HQ</h4>
                        </div>
                    </li>
                    <li className="squircle purple-one">
                        <div className="popup">
                            <h4 className="popup-text">CREW</h4>
                        </div>
                    </li>
                    <li className="squircle green-one">
                        <div className="popup">
                            <h4 className="popup-text">GYM SQUAD</h4>
                        </div>
                    </li>
                    <li className="squircle green-one">
                        <div className="popup">
                            <h4 className="popup-text">CODERS</h4>
                        </div>
                    </li>
                    <li className="squircle purple-one">
                        <div className="popup">
                            <h4 className="popup-text">THE DEFTONES</h4>
                        </div>
                    </li>
                </ul>
            </nav>
            <header className="header">
                <div className="nav-icons">
                    <Link to="/">
                        <img src={homeIcon} alt="Home" className="icon" />
                    </Link>
                    <Link to="/inbox">
                        <img src={chatIcon} alt="Inbox" className="icon" />
                    </Link>
                    <Link to="/notifications">
                        <img
                            src={notificationIcon}
                            alt="Notifications"
                            className="icon"
                        />
                    </Link>
                </div>
            </header>
            <main className="main">
                <section className="friends-list">
                    <h4 className="friend-title">Friends:</h4>
                    <div className="friend-item">
                        <img
                            src={ProfilePicture}
                            alt="Profile"
                            className="profile-pic"
                        />
                        <span className="friend-name">John Doe</span>
                    </div>
                    <div className="friend-item">
                        <img
                            src={ProfilePicture}
                            alt="Profile"
                            className="profile-pic"
                        />
                        <span className="friend-name">John Doe</span>
                    </div>
                    <div className="friend-item">
                        <img
                            src={ProfilePicture}
                            alt="Profile"
                            className="profile-pic"
                        />
                        <span className="friend-name">John Doe</span>
                    </div>
                    <div className="friend-item">
                        <img
                            src={ProfilePicture}
                            alt="Profile"
                            className="profile-pic"
                        />
                        <span className="friend-name">John Doe</span>
                    </div>
                </section>
                <section className="chat">
                    {/* Chat content goes here */}
                </section>
            </main>
        </div>
    );
}
