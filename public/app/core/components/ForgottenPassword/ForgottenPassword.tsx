import React, { FC, useState } from 'react';
import { Form, Field, Input, Button, Legend, Container, useStyles, HorizontalGroup, LinkButton } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';
import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import config from 'app/core/config';

interface EmailDTO {
  userOrEmail: string;
}

const paragraphStyles = (theme: GrafanaTheme) => css`
  color: ${theme.colors.formDescription};
  font-size: ${theme.typography.size.sm};
  font-weight: ${theme.typography.weight.regular};
  margin-top: ${theme.spacing.sm};
  display: block;
`;

export const ForgottenPassword: FC = () => {
  const [emailSent, setEmailSent] = useState(false);
  const styles = useStyles(paragraphStyles);
  const loginHref = `${config.appSubUrl}/login`;

  const sendEmail = async (formModel: EmailDTO) => {
    const res = await getBackendSrv().post('/api/user/password/send-reset-email', formModel);
    if (res) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div>
        <p>一封带有重置密码链接的电子邮件已经发送到该邮件地址。请检查你的邮箱。</p>
        <Container margin="md" />
        <LinkButton variant="primary" href={loginHref}>
          返回登录
        </LinkButton>
      </div>
    );
  }
  return (
    <Form onSubmit={sendEmail}>
      {({ register, errors }) => (
        <>
          <Legend>重置密码</Legend>
          <Field
            label="用户"
            description="请输入您的信息以获得一个重置密码的链接"
            invalid={!!errors.userOrEmail}
            error={errors?.userOrEmail?.message}
          >
            <Input placeholder="用户名或密码" name="用户名或密码" ref={register({ required: true })} />
          </Field>
          <HorizontalGroup>
            <Button>发送重置密码邮件</Button>
            <LinkButton variant="link" href={loginHref}>
              返回登录
            </LinkButton>
          </HorizontalGroup>

          <p className={styles}>忘记用户名或邮箱？请联系管理员。</p>
        </>
      )}
    </Form>
  );
};
