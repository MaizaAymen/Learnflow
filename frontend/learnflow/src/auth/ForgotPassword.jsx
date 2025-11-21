import React, { useState } from "react";
import {
  Layout,
  Form,
  Input,
  Button,
  message,
  Card,
  Steps,
  Space,
  Result,
  Spin,
  Row,
  Col,
  theme,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0); // 0: Email, 1: OTP, 2: New Password, 3: Success
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Step 1: Request OTP
  const handleRequestOTP = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEmail(values.email);
        setOtpSent(true);
        setCurrentStep(1);
        startResendTimer();
        message.success("OTP sent to your email!");
      } else {
        message.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      message.error("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: values.otp,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setOtpVerified(true);
        setCurrentStep(2);
        message.success("OTP verified successfully!");
      } else {
        message.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      message.error("Error verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
            newPassword: values.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCurrentStep(3);
        message.success("Password reset successfully!");
      } else {
        message.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      message.error("Error resetting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        startResendTimer();
        message.success("OTP resent to your email!");
      } else {
        message.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      message.error("Error resending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content style={{ padding: "50px 20px" }}>
        <Row justify="center" style={{ minHeight: "100vh" }}>
          <Col xs={24} sm={20} md={12} lg={8}>
            <Card
              style={{
                borderRadius: borderRadiusLG,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Back Button */}
              <Button
                icon={<ArrowLeftOutlined />}
                type="text"
                onClick={() => navigate("/login")}
                style={{ marginBottom: 20 }}
              >
                Back to Login
              </Button>

              {/* Steps */}
              <Steps
                current={currentStep}
                items={[
                  { title: "Email", icon: <MailOutlined /> },
                  { title: "OTP", icon: <LockOutlined /> },
                  { title: "Password", icon: <LockOutlined /> },
                  { title: "Done", icon: <CheckCircleOutlined /> },
                ]}
                style={{ marginBottom: 30 }}
              />

              <Spin spinning={loading}>
                {/* Step 1: Request OTP */}
                {currentStep === 0 && (
                  <div>
                    <h2 style={{ textAlign: "center", marginBottom: 24 }}>
                      Forgot Password
                    </h2>
                    <p style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
                      Enter your email address and we'll send you an OTP to reset your
                      password.
                    </p>
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleRequestOTP}
                    >
                      <Form.Item
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your email!",
                          },
                          {
                            type: "email",
                            message: "Please enter a valid email!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter your email"
                          prefix={<MailOutlined />}
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          size="large"
                          loading={loading}
                        >
                          Send OTP
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                )}

                {/* Step 2: Verify OTP */}
                {currentStep === 1 && (
                  <div>
                    <h2 style={{ textAlign: "center", marginBottom: 24 }}>
                      Verify OTP
                    </h2>
                    <p style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
                      We've sent an OTP to <strong>{email}</strong>. Please enter it below.
                    </p>
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleVerifyOTP}
                    >
                      <Form.Item
                        name="otp"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the OTP!",
                          },
                          {
                            len: 6,
                            message: "OTP must be 6 digits!",
                          },
                          {
                            pattern: /^\d+$/,
                            message: "OTP must contain only numbers!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          size="large"
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          size="large"
                          loading={loading}
                        >
                          Verify OTP
                        </Button>
                      </Form.Item>

                      <div style={{ textAlign: "center", marginTop: 16 }}>
                        {resendTimer > 0 ? (
                          <p style={{ color: "#666" }}>
                            Resend OTP in <strong>{resendTimer}s</strong>
                          </p>
                        ) : (
                          <Button
                            type="link"
                            onClick={handleResendOTP}
                            loading={loading}
                          >
                            Resend OTP
                          </Button>
                        )}
                      </div>
                    </Form>
                  </div>
                )}

                {/* Step 3: Reset Password */}
                {currentStep === 2 && (
                  <div>
                    <h2 style={{ textAlign: "center", marginBottom: 24 }}>
                      Set New Password
                    </h2>
                    <p style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
                      Enter your new password below.
                    </p>
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleResetPassword}
                    >
                      <Form.Item
                        name="newPassword"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your new password!",
                          },
                          {
                            min: 8,
                            message: "Password must be at least 8 characters!",
                          },
                          {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message:
                              "Password must contain uppercase, lowercase, and numbers!",
                          },
                        ]}
                      >
                        <Input.Password
                          placeholder="Enter new password"
                          prefix={<LockOutlined />}
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        name="confirmPassword"
                        rules={[
                          {
                            required: true,
                            message: "Please confirm your password!",
                          },
                        ]}
                      >
                        <Input.Password
                          placeholder="Confirm password"
                          prefix={<LockOutlined />}
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          size="large"
                          loading={loading}
                        >
                          Reset Password
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                )}

                {/* Step 4: Success */}
                {currentStep === 3 && (
                  <div>
                    <Result
                      status="success"
                      title="Password Reset Successfully"
                      subTitle="Your password has been reset successfully. You can now login with your new password."
                      extra={
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => navigate("/login")}
                        >
                          Back to Login
                        </Button>
                      }
                    />
                  </div>
                )}
              </Spin>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ForgotPassword;
