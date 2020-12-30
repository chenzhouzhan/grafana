import React, { FC, useState } from 'react';
import { css } from 'emotion';
import { Button, HorizontalGroup, Modal, stylesFactory, useTheme } from '@grafana/ui';
import { AppEvents, GrafanaTheme } from '@grafana/data';
import { FolderInfo } from 'app/types';
import { FolderPicker } from 'app/core/components/Select/FolderPicker';
import appEvents from 'app/core/app_events';
import { DashboardSection, OnMoveItems } from '../types';
import { getCheckedDashboards } from '../utils';
import { moveDashboards } from 'app/features/manage-dashboards/state/actions';

interface Props {
  onMoveItems: OnMoveItems;
  results: DashboardSection[];
  isOpen: boolean;
  onDismiss: () => void;
}

export const MoveToFolderModal: FC<Props> = ({ results, onMoveItems, isOpen, onDismiss }) => {
  const [folder, setFolder] = useState<FolderInfo | null>(null);
  const theme = useTheme();
  const styles = getStyles(theme);
  const selectedDashboards = getCheckedDashboards(results);

  const moveTo = () => {
    if (folder && selectedDashboards.length) {
      const folderTitle = folder.title ?? '默认文件夹';

      moveDashboards(selectedDashboards.map(d => d.uid) as string[], folder).then((result: any) => {
        if (result.successCount > 0) {
          const ending = result.successCount === 1 ? '' : 's';
          const header = `仪表盘${ending} 已移动`;
          const msg = `${result.successCount} 个仪表盘${ending} 移动至 ${folderTitle}`;
          appEvents.emit(AppEvents.alertSuccess, [header, msg]);
        }

        if (result.totalCount === result.alreadyInFolderCount) {
          appEvents.emit(AppEvents.alertError, ['错误', `仪表盘以及属于文件夹： ${folderTitle}`]);
        } else {
          onMoveItems(selectedDashboards, folder);
        }

        onDismiss();
      });
    }
  };

  return isOpen ? (
    <Modal className={styles.modal} title="选择仪表盘文件夹" icon="folder-plus" isOpen={isOpen} onDismiss={onDismiss}>
      <>
        <div className={styles.content}>
          <p>移动 {selectedDashboards.length} 个选中的仪表盘到下面的文件夹：</p>
          <FolderPicker onChange={f => setFolder(f as FolderInfo)} useNewForms />
        </div>

        <HorizontalGroup justify="center">
          <Button variant="primary" onClick={moveTo}>
            移动
          </Button>
          <Button variant="secondary" onClick={onDismiss}>
            取消
          </Button>
        </HorizontalGroup>
      </>
    </Modal>
  ) : null;
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    modal: css`
      width: 500px;
    `,
    content: css`
      margin-bottom: ${theme.spacing.lg};
    `,
  };
});
