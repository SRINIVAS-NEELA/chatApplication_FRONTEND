import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { flexbox } from '@material-ui/system';

import Fab from '@material-ui/core/Fab';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import io from 'socket.io-client';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Divider } from '@material-ui/core';



const styles = theme => ({
    main: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: "100px"

    },
    paper: {
        paddingTop: theme.spacing.unit * 5,
        ...theme.mixins.gutters(),
        paddingBottom: theme.spacing.unit * 5,
        alignItems: 'center'
    },
    form: {
        display: flexbox,
        justifyContent: 'center',
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },
    margin: {
        margin: theme.spacing.unit,
    },
    root: {
        flexGrow: 1,
    },
    typography: {
        display: 'flex',
        justifyContent: 'center'
    },
    message: {
        backgroundColor: 'Lightgrey',
        textAlign: 'left',
        borderRadius: 4,
        padding: 2,
        marginBottom: 4
    },
    meMessage: {
        backgroundColor: 'lightblue',
        textAlign: 'right',
        padding: 2,
        borderRadius: 4,
        marginBottom: 4
    }

});


class UserForm extends React.Component {
    state = {
        userName: '',
        showChannels: false,
        channelsList: [],
        currentChannelId: '',
        messages: [],
        message: '',
        channelName: '',
        userId: '',
        currentChannelName: ''
    }

    componentDidMount() {
        this.socket = io('http://localhost:3000');
        this.socket.on('connect', function () {
            console.log("=== CONNECTION SUCCESSFULL ===")
        });
        this.socket.on('disconnect', function () {
            console.log("=== DISCONNECTED ===")
        });
        this.socket.on('add_user', (data) => {
            console.log(data)
        });
        this.socket.on('channels', ({ channels, userId }) => {
            this.setState({ channels, showChannels: true, userId })
        })
        this.socket.on('message', ({ messages }) => {
            this.setState({ messages })
        })
    }

    onChannelClick = channel => {
        this.socket.emit('message', { channelId: channel._id })
        this.setState({ currentChannelId: channel._id, currentChannelName: channel.channelName })
    }

    onChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value.trim() });
    }

    onLoginSubmit = async evt => {
        evt.preventDefault();
        this.socket.emit('add_user', { userName: this.state.userName })
    }

    onNewChannel = async evt => {
        evt.preventDefault();
        this.setState({
            channelName: ''
        })
        const { channelName, userId } = this.state
        this.socket.emit('new_channel', { channelName, userId })
    }
    sendMessage = () => {
        this.setState({ message: '' })
        this.socket.emit('new_message', { channelId: this.state.currentChannelId, userId: this.state.userId, userName: this.state.userName, message: this.state.message })
    }

    render() {
        const { userName } = this.state;
        const { classes } = this.props;
        return (


            <main className={classes.main}>
                {!this.state.showChannels ? <Paper className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        CHAT APPLICATION
                    </Typography>
                    <form className={classes.form} onSubmit={this.onLoginSubmit}>
                        <FormControl margin="normal" required>
                            <InputLabel htmlFor="userName">Enter User Name</InputLabel>
                            <Input name="userName" value={userName} onChange={this.onChange} autoFocus />
                        </FormControl>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit} >
                            LOGIN
                        </Button>
                    </form>
                </Paper> :
                    <Paper className={classes.paper}>
                        {!this.state.currentChannelId ?
                            <>
                                <Typography className={classes.typography}>CHANNELS LIST</Typography>

                                <List >
                                    {this.state.channels.map((x, i) =>
                                        <React.Fragment key={i}>
                                            <ListItem button onClick={() => this.onChannelClick(x)}>
                                                <ListItemText
                                                    primary={'- ' + x.channelName}
                                                />
                                            </ListItem>
                                            <Divider />
                                        </React.Fragment>
                                    )}
                                </List>
                                <Input value={this.state.channelName} type="text" name='channelName' placeholder="Enter Channel Name" onChange={this.onChange} autoFocus />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={this.state.channelName && this.onNewChannel}
                                    className={classes.submit} >
                                    ADD CHANNEL
                                    </Button>

                            </>
                            :
                            <>

                                <Typography className={classes.typography}>{this.state.currentChannelName}</Typography>


                                {this.state.messages.map((x, i) =>

                                    <div key={i}>
                                        <Typography className={x.createdBy === this.state.userId ? classes.meMessage : classes.message}>{x.message}</Typography>
                                    </div>)}

                                <Input value={this.state.message} type="text" name='message' placeholder="start typing" onChange={this.onChange} />
                                <Fab
                                    color="primary"
                                    size="small"
                                    onClick={this.state.message && this.sendMessage}
                                    className={classes.submit} >
                                    <ArrowRightIcon />
                                </Fab>
                            </>
                        }
                    </Paper>
                }
            </main>
        );

    }
}
UserForm.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserForm);


