import React, { FC } from 'react';
import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import { ConfirmModal, stylesFactory, useTheme } from '@grafana/ui';
import { getLocationSrv } from '@grafana/runtime';
import { DashboardSection, OnDeleteItems } from '../types';
import { getCheckedUids } from '../utils';
import { deleteFoldersAndDashboards } from 'app/features/manage-dashboards/state/actions';

interface Props {
  onDeleteItems: OnDeleteItems;
  results: DashboardSection[];
  isOpen: boolean;
  onDismiss: () => void;
}

export const ConfirmDeleteModal: FC<Props> = ({ results, onDeleteItems, isOpen, onDismiss }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const uids = getCheckedUids(results);
  const { folders, dashboards } = uids;
  const folderCount = folders.length;
  const dashCount = dashboards.length;

  let text = '你想要删除 ';
  let subtitle;
  const dashEnding = dashCount === 1 ? '' : 's';
  const folderEnding = folderCount === 1 ? '' : 's';

  if (folderCount > 0 && dashCount > 0) {
    text += `选中的文件夹${folderEnding} 和仪表盘${dashEnding}?\n`;
    subtitle = `所有在选中文件夹内的仪表盘${folderEnding} 也会被删除`;
  } else if (folderCount > 0) {
    text += `选中的文件夹${folderEnding} 以及文件夹下所有的仪表盘?`;
  } else {
    text += `选中的仪表盘${dashEnding}?`;
  }

  const deleteItems = () => {
    deleteFoldersAndDashboards(folders, dashboards).then(() => {
      onDismiss();
      // Redirect to /dashboard in case folder was deleted from f/:folder.uid
      getLocationSrv().update({ path: '/dashboards' });
      onDeleteItems(folders, dashboards);
    });
  };

  return isOpen ? (
    <ConfirmModal
      isOpen={isOpen}
      title="删除"
      body={
        <>
          {text} {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </>
      }
      confirmText="删除"
      onConfirm={deleteItems}
      onDismiss={onDismiss}
    />
  ) : null;
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    subtitle: css`
      font-size: ${theme.typography.size.base};
      padding-top: ${theme.spacing.md};
    `,
  };
});
