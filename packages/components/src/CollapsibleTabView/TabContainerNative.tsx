import type { ForwardRefRenderFunction } from 'react';
import { Children, useCallback, useMemo } from 'react';

import type { ForwardRefHandle } from '@onekeyhq/app/src/views/NestedTabView/NestedTabView';
import NestedTabView from '@onekeyhq/app/src/views/NestedTabView/NestedTabView';
import type { TabProps } from '@onekeyhq/app/src/views/NestedTabView/types';
import { useThemeValue } from '@onekeyhq/components';
import platformEnv from '@onekeyhq/shared/src/platformEnv';

import { Body2StrongProps } from '../Typography';

import type { CollapsibleContainerProps } from './types';
import type { NativeSyntheticEvent } from 'react-native';

const TabContainerNativeView: ForwardRefRenderFunction<
  ForwardRefHandle,
  CollapsibleContainerProps
> = (
  {
    disableRefresh,
    refreshing,
    headerView,
    children,
    onIndexChange,
    onRefresh,
    initialTabName,
    containerStyle,
    scrollEnabled = true,
    ...props
  },
  ref,
) => {
  const tabsInfo = useMemo(() => {
    const tabs = Children.map(children, (child) =>
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      ({ name: child.props.name, label: child.props.label }),
    ) as TabProps[];

    let selectedIndex = tabs.findIndex((tab) => tab.name === initialTabName);
    if (selectedIndex < 0) {
      selectedIndex = 0;
    }
    return {
      tabs,
      selectedIndex,
    };
  }, [children, initialTabName]);

  const [
    activeLabelColor,
    labelColor,
    indicatorColor,
    bgColor,
    bottomLineColor,
    spinnerColor,
  ] = useThemeValue([
    'text-default',
    'text-subdued',
    'action-primary-default',
    'surface-default',
    'border-subdued',
    'text-default',
  ]);

  const tabViewStyle = useMemo(() => {
    const sharedStyle = {
      height: 54,
      indicatorColor,
      bottomLineColor,
      labelStyle: Body2StrongProps,
    };
    // why? ios and android use different styles
    if (platformEnv.isNativeIOS) {
      return {
        ...sharedStyle,
        activeColor: activeLabelColor,
        inactiveColor: labelColor,
        paddingX: 0,
      };
    }
    return {
      ...sharedStyle,
      activeLabelColor,
      labelColor,
      backgroundColor: bgColor,
    };
  }, [activeLabelColor, bgColor, bottomLineColor, indicatorColor, labelColor]);

  const onRefreshCallBack = useCallback(() => {
    setTimeout(() => {
      onRefresh?.();
    });
  }, [onRefresh]);

  const onChange = useCallback(
    (e: NativeSyntheticEvent<{ tabName: string; index: number }>) => {
      onIndexChange?.(e.nativeEvent?.index);
    },
    [onIndexChange],
  );

  return (
    <NestedTabView
      ref={ref}
      values={tabsInfo.tabs}
      defaultIndex={tabsInfo.selectedIndex}
      style={containerStyle}
      disableRefresh={disableRefresh}
      refresh={refreshing}
      spinnerColor={platformEnv.isNativeIOS ? spinnerColor : undefined} // only ios?
      tabViewStyle={tabViewStyle}
      onRefreshCallBack={onRefreshCallBack}
      headerView={headerView}
      onChange={onChange}
      scrollEnabled={scrollEnabled}
      {...props}
    >
      {children}
    </NestedTabView>
  );
};

export const TabContainerNative: typeof TabContainerNativeView =
  TabContainerNativeView;
// export const TabContainerNative: typeof TabContainerNativeView = memo(
//   TabContainerNativeView,
// );
