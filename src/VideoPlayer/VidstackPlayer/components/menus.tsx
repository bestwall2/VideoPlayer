import React from "react";
import type { ReactNode } from 'react';

import {
  Menu,
  Tooltip,
  useCaptionOptions,
  type MenuPlacement,
  type TooltipPlacement,
  useVideoQualityOptions,
  useMediaState,
  usePlaybackRateOptions,
} from "@vidstack/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClosedCaptionsIcon,
  SettingsMenuIcon,
  RadioButtonIcon,
  RadioButtonSelectedIcon,
  SettingsIcon,
  SettingsSwitchIcon,
  OdometerIcon,
} from "@vidstack/react/icons";

import buttonStyles from '../styles/button.module.css';
import styles from '../styles/menu.module.css';
import tooltipStyles from '../styles/tooltip.module.css';
// import { useSettings } from '@/lib/store'; // Removed
// import { useStore } from 'zustand'; // Removed

export interface SettingsProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
  // offset?: Number; // Removed unused prop
  subtitles?: any
}

export const menuClass =
'z-30 flex cust-scroll h-[var(--menu-height)] max-h-[180px] lg:max-h-[400px] min-w-[260px] flex-col overflow-y-auto overscroll-y-contain rounded-md border border-white/10 bg-black p-1 font-sans text-[15px] font-medium outline-none backdrop-blur-sm transition-[height] duration-300 will-change-[height] data-[resizing]:overflow-hidden';

export function Settings({ placement, tooltipPlacement, subtitles }: SettingsProps) {

  return (
    <Menu.Root className="parent">
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
      <Menu.Button className={`${styles.menuButton} ${buttonStyles.button}`}>
      <SettingsIcon className={styles.rotateIcon} />
        </Menu.Button>
      </Tooltip.Trigger>
      <Tooltip.Content
        // offset={offset}
        className={`${tooltipStyles.tooltip} parent-data-[open]:hidden`}
        placement={tooltipPlacement}
        >
        Settings
      </Tooltip.Content>
    </Tooltip.Root>
      <Menu.Content className={menuClass} placement={placement}>
      <AutoPlay />
        <AutoNext />
        <AutoSkip />
        <SpeedSubmenu />
        {  subtitles?.length > 0 && <CaptionSubmenu/>}
        <QualitySubmenu />
        </Menu.Content>
      {/* </Menu.Portal> */}
  </Menu.Root>
);
}

function SpeedSubmenu() {
  const options = usePlaybackRateOptions(),
    hint =
      options.selectedValue === "1" ? "Normal" : options.selectedValue + "x";
  return (
    <Menu.Root>
      <SubmenuButton
        label="Playback Rate"
        hint={hint}
        icon={OdometerIcon}
        disabled={options.disabled}
      >
        Speed ({hint})
      </SubmenuButton>
      <Menu.Content className={styles.submenu}>
        <Menu.RadioGroup
          className="w-full flex flex-col"
          value={options.selectedValue}
        >
          {options.map(({ label, value, select }) => (
            <Radio value={value} onSelect={select} key={value}>
              {label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

function CaptionSubmenu() {
  const options = useCaptionOptions(),
    hint = options.selectedTrack?.label ?? "Off";
  return (
    <Menu.Root>
      <SubmenuButton
        label="Captions"
        hint={hint}
        disabled={options.disabled}
        icon={ClosedCaptionsIcon}
      />
      <Menu.Content className={styles.submenu}>
      <Menu.RadioGroup className={styles.radioGroup} value={options.selectedValue}>
          {options.map(({ label, value, select }) => (
            <Radio value={value} onSelect={select} key={value}>
              {label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}


function AutoPlay() {
  const options = [
    { label: "On", value: "true" },
    { label: "Off", value: "false" },
  ];

  // const settings = useStore(useSettings, (state) => state.settings); // Removed

  return (
    <Menu.Root>
      <SubmenuButton
        label="Autoplay Video"
        hint={"On"} // Default hint
        icon={SettingsSwitchIcon}
      />
      <Menu.Content className={styles.submenu}>
        <Menu.RadioGroup
          className={styles.radioGroup}
          value={"true"} // Default value
          // onChange={(value) => { // Removed onChange logic
          //   const boolValue = value === "true";
          //   setOptions((options) =>
          //     options.map((option) =>
          //       option.value === boolValue
          //         ? { ...option, selected: true }
          //         : { ...option, selected: false }
          //     )
          //   );
          //   // useSettings.setState({ settings: { ...useSettings.getState().settings, autoplay: boolValue } })
          // }}
        >
          {options.map((option) => (
            <Radio key={option.label} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}


function AutoNext() {
  const options = [
    { label: "On", value: "true" },
    { label: "Off", value: "false" },
  ];

  // const settings = useStore(useSettings, (state) => state.settings); // Removed

  return (
    <Menu.Root>
      <SubmenuButton
        label="Autoplay Next"
        hint={"On"} // Default hint
        icon={SettingsSwitchIcon}
      />
      <Menu.Content className={styles.submenu}>
        <Menu.RadioGroup
          className={styles.radioGroup}
          value={"true"} // Default value
          // onChange={(value) => { // Removed onChange logic
          //   const boolValue = value === "true";
          //   setOptions((options) =>
          //     options.map((option) =>
          //       option.value === boolValue
          //         ? { ...option, selected: true }
          //         : { ...option, selected: false }
          //     )
          //   );
          //   // useSettings.setState({ settings: { ...useSettings.getState().settings, autonext: boolValue } })
          // }}
        >
          {options.map((option) => (
            <Radio key={option.label} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

function AutoSkip() {
  const options = [
    { label: "On", value: "true" },
    { label: "Off", value: "false" },
  ];

  // const settings = useStore(useSettings, (state) => state.settings); // Removed

  return (
    <Menu.Root>
      <SubmenuButton
        label="AutoSkip"
        hint={"On"} // Default hint
        icon={SettingsSwitchIcon}
      />
      <Menu.Content className={styles.submenu}>
        <Menu.RadioGroup
          className={styles.radioGroup}
          value={"true"} // Default value
          // onChange={(value) => { // Removed onChange logic
          //   const boolValue = value === "true";
          //   setOptions((options) =>
          //     options.map((option) =>
          //       option.value === boolValue
          //         ? { ...option, selected: true }
          //         : { ...option, selected: false }
          //     )
          //   );
          //   // useSettings.setState({ settings: { ...useSettings.getState().settings, autoskip: boolValue } })
          // }}
        >
          {options.map((option) => (
            <Radio key={option.label} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

function QualitySubmenu() {
  const options = useVideoQualityOptions({ sort: "descending" }),
    autoQuality = useMediaState("autoQuality"),
    currentQualityText = options.selectedQuality?.height + "p" ?? "",
    hint = !autoQuality ? currentQualityText : `Auto (${currentQualityText})`;

  return (
    <Menu.Root>
      <SubmenuButton
        label="Quality"
        hint={hint}
        disabled={options.disabled}
        icon={SettingsMenuIcon}
      />
      <Menu.Content className={styles.submenu}>
        <Menu.RadioGroup
         className={styles.radioGroup}
         value={options.selectedValue}
        >
          {options.map(({ label, value, bitrateText, select }) => (
            <Radio value={value} onSelect={select} key={value}>
              {label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

export interface RadioProps extends Menu.RadioProps {}

function Radio({ children, ...props }: RadioProps) {
  return (
    <Menu.Radio
      className="ring-media-focus group relative flex w-full cursor-pointer select-none items-center justify-start rounded-sm p-2.5 outline-none data-[hocus]:bg-white/10 data-[focus]:ring-[3px]"
      {...props}
    >
      <RadioButtonIcon className="h-4 w-4 text-white group-data-[checked]:hidden" />
      <RadioButtonSelectedIcon
        className="text-media-brand hidden h-4 w-4 group-data-[checked]:block"
        type="radio-button-selected"
      />
      <span className="ml-2">{children}</span>
    </Menu.Radio>
  );
}

export interface SubmenuButtonProps {
  label: string;
  hint: any;
  disabled?: boolean;
  icon: ReactNode;
}

function SubmenuButton({
  label,
  hint,
  icon: Icon,
  disabled,
}: SubmenuButtonProps) {
  return (
    <Menu.Button className={styles.submenuButton} disabled={disabled}>
      <ChevronLeftIcon className={styles.submenuCloseIcon} />
      <Icon className={styles.submenuIcon} />
      <span className={styles.submenuLabel}>{label}</span>
      <span className={styles.submenuHint}>{hint}</span>
      <ChevronRightIcon className={styles.submenuOpenIcon} />
    </Menu.Button>
  );
}