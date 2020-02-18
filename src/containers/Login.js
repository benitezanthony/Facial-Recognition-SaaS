import React from "react";
import {
  Button,
  Form,
  Grid,
  Header,
  Message,
  Segment
} from "semantic-ui-react";
import { connect } from "react-redux";
import { NavLink, Redirect } from "react-router-dom";
import { authLogin as login } from "../store/actions/auth";

class LoginForm extends React.Component {
  state = {
    username: "",
    password: "",
    formError: null,
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
      /* use to reset error messages when user begins typing */
      formError: null,
    });

  };

  handleSubmit = e => {
    e.preventDefault();

    const { username, password } = this.state;

    /* used to verify all form fields were provided a value */
    if (username !== '' && password !== '') {
      this.props.login(username, password);
    }
    else {
      this.setState({
        formError: "Please enter all credentials (username & password)"
      })
    }

  };

  render() {
    const { error, loading, authenticated } = this.props;
    const { username, password, formError } = this.state;

    if (authenticated) {
      return <Redirect to="/" />;
    }

    return (
      <Grid
        textAlign="center"
        style={{ height: "100vh" }}
        verticalAlign="middle"
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" color="teal" textAlign="center">
            Log-in to your account
          </Header>
          {error && <p>{this.props.error.message}</p>}

          <React.Fragment>
            <Form size="large" onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  onChange={this.handleChange}
                  value={username}
                  name="username"
                  fluid
                  icon="user"
                  iconPosition="left"
                  placeholder="Username"
                />
                <Form.Input
                  onChange={this.handleChange}
                  fluid
                  value={password}
                  name="password"
                  icon="lock"
                  iconPosition="left"
                  placeholder="Password"
                  type="password"
                />

                <Button
                  color="teal"
                  fluid
                  size="large"
                  loading={loading}
                  disabled={loading}
                >
                  Login
                </Button>
              </Segment>
            </Form>
            {formError && (
              <Message negative>
                <Message.Header>A form error occurred</Message.Header>
                <p>{formError}</p>
              </Message>
            )}
            {error && (
              <Message negative>
                <Message.Header>An error occurred</Message.Header>
                <p>{error}</p>
              </Message>
            )}
            <Message>
              New to us? <NavLink to="/signup">Sign Up</NavLink>
            </Message>
          </React.Fragment>
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    token: state.auth.token,
    authenticated: state.auth.token !== null
  };
};

const mapDispatchToProps = dispatch => {
  return {
    login: (username, password) => dispatch(login(username, password))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginForm);
