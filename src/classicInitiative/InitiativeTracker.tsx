import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Tooltip, Icon, useTheme } from "@mui/material";

import { useEffect, useState } from "react";

import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Box from "@mui/material/Box";

import SkipPreviousRoundedIcon from "@mui/icons-material/SkipPreviousRounded";
import SkipNextRounded from "@mui/icons-material/SkipNextRounded";

import OBR, { isImage, Item, Metadata } from "@owlbear-rodeo/sdk";

import { InitiativeItem } from "../components/InitiativeItem";

import { InitiativeListItem } from "./InitiativeListItem";
import { getPluginId } from "../helpers/getPluginId";
import { InitiativeHeader } from "../components/InitiativeHeader";
import { isPlainObject } from "../helpers/isPlainObject";
import { sortFromOrder, sortList, useOrder } from "./sceneOrder";

import {
  ADVANCED_CONTROLS_METADATA_ID,
  DISABLE_NOTIFICATION_METADATA_ID,
  DISPLAY_ROUND_METADATA_ID,
  readBooleanFromMetadata,
  readNumberFromMetadata,
  ROUND_COUNT_METADATA_ID,
  SELECT_ACTIVE_ITEM_METADATA_ID,
  SORT_ASCENDING_METADATA_ID,
  updateRoundCount,
} from "../helpers/metadataHelpers";

import SortAscendingIcon from "../assets/SortAscendingIcon";
import SortDescendingIcon from "../assets/SortDescendingIcon";
import SettingsButton from "../settings/SettingsButton";
import { labelItem, selectItem } from "../helpers/findItem";
import useSelection from "../helpers/useSelection";
import HeightMonitor from "../components/HeightMonitor";
import { RoundControl } from "../components/RoundControl";
import { broadcastRoundChangeEventMessage } from "../helpers/broadcastRoundImplementation";

function isMetadata(
  metadata: unknown,
): metadata is { count: string; active: boolean } {
  return (
    isPlainObject(metadata) &&
    typeof metadata.count === "string" &&
    typeof metadata.active === "boolean"
  );
}

export function InitiativeTracker({ role }: { role: "PLAYER" | "GM" }) {
  const [selectActiveItem, setSelectActiveItem] = useState(0);
  const [sortAscending, setSortAscending] = useState(false);
  const [advancedControls, setAdvancedControls] = useState(false);
  const [displayRound, setDisplayRound] = useState(false);
  const [disableNotifications, setDisableNotifications] = useState(false);

  const [initiativeItems, setInitiativeItems] = useState<InitiativeItem[]>([]);
  const [roundCount, setRoundCount] = useState(1);

  const selection = useSelection();

  useEffect(() => {
    const handleSceneMetadataChange = (sceneMetadata: Metadata) => {
      setRoundCount(
        readNumberFromMetadata(
          sceneMetadata,
          ROUND_COUNT_METADATA_ID,
          roundCount,
        ),
      );
    };
    OBR.scene.getMetadata().then(handleSceneMetadataChange);
    return OBR.scene.onMetadataChange(handleSceneMetadataChange);
  }, []);

  useEffect(() => {
    const handleRoomMetadataChange = (roomMetadata: Metadata) => {
      setSortAscending(
        readBooleanFromMetadata(
          roomMetadata,
          SORT_ASCENDING_METADATA_ID,
          sortAscending,
        ),
      );
      setAdvancedControls(
        readBooleanFromMetadata(
          roomMetadata,
          ADVANCED_CONTROLS_METADATA_ID,
          advancedControls,
        ),
      );
      setDisplayRound(
        readBooleanFromMetadata(
          roomMetadata,
          DISPLAY_ROUND_METADATA_ID,
          displayRound,
        ),
      );
      setDisableNotifications(
        readBooleanFromMetadata(
          roomMetadata,
          DISABLE_NOTIFICATION_METADATA_ID,
          disableNotifications,
        ),
      );
      setSelectActiveItem(
        readNumberFromMetadata(
          roomMetadata,
          SELECT_ACTIVE_ITEM_METADATA_ID,
          selectActiveItem,
        ),
      );
    };
    OBR.room.getMetadata().then(handleRoomMetadataChange);
    return OBR.room.onMetadataChange(handleRoomMetadataChange);
  }, []);

  useEffect(() => {
    const handleItemsChange = async (items: Item[]) => {
      const initiativeItems: InitiativeItem[] = [];
      for (const item of items) {
        if (isImage(item)) {
          const metadata = item.metadata[getPluginId("metadata")];
          if (isMetadata(metadata)) {
            initiativeItems.push({
              id: item.id,
              count: metadata.count,
              url: item.image.url,
              name: item.text.plainText || item.name,
              active: metadata.active,
              visible: item.visible,
              ready: true,
              group: 0,
              groupIndex: 0,
            });
          }
        }
      }
      setInitiativeItems(initiativeItems);
    };

    OBR.scene.items.getItems().then(handleItemsChange);
    return OBR.scene.items.onChange(handleItemsChange);
  }, []);

  function handleSortClick() {
    if (role !== "GM") return;

    const sorted = sortList(initiativeItems, sortAscending);

    if (initiativeItems.length > 1) {
      const index = sorted.findIndex((i) => i.active);
      if (index >= sorted.length - 1) {
        const newRoundCount = roundCount + 1;
        updateRoundCount(newRoundCount, setRoundCount);
        broadcastRoundChangeEventMessage(newRoundCount);
      }
    }

    const nextIndex = 0;

    setInitiativeItems(
      sorted.map((item, index) => {
        const active = index === 0;
        if (selectActiveItem === 1 && active) selectItem(item.id);
        if (selectActiveItem === 2 && active) labelItem(item.id);
        return { ...item, active };
      }),
    );

    OBR.scene.items.updateItems(
      sorted.map((i) => i.id),
      (items) => {
        items.forEach((item, i) => {
          const metadata = item.metadata[getPluginId("metadata")];
          if (isMetadata(metadata)) {
            metadata.active = i === nextIndex;
          }
        });
      },
    );
  }

  function handleDirectionClick(next = true) {
    if (role !== "GM") return;

    const sorted = sortFromOrder(initiativeItems, order);
    let newIndex =
      sorted.findIndex((i) => i.active) + (next ? 1 : -1);

    if (newIndex < 0) newIndex = sorted.length - 1;
    if (newIndex >= sorted.length) newIndex = 0;

    setInitiativeItems(
      sorted.map((item, index) => {
        const active = index === newIndex;
        if (selectActiveItem === 1 && active) selectItem(item.id);
        if (selectActiveItem === 2 && active) labelItem(item.id);
        return { ...item, active };
      }),
    );

    OBR.scene.items.updateItems(
      sorted.map((i) => i.id),
      (items) => {
        items.forEach((item, i) => {
          const metadata = item.metadata[getPluginId("metadata")];
          if (isMetadata(metadata)) {
            metadata.active = i === newIndex;
          }
        });
      },
    );
  }

  function handleInitiativeCountChange(id: string, newCount: string) {
    if (role !== "GM") return;

    setInitiativeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, count: newCount } : item,
      ),
    );

    OBR.scene.items.updateItems([id], (items) => {
      items.forEach((item) => {
        const metadata = item.metadata[getPluginId("metadata")];
        if (isMetadata(metadata)) {
          metadata.count = newCount;
        }
      });
    });
  }

  const order = useOrder();
  const sortedInitiativeItems = sortFromOrder(initiativeItems, order);
  const themeIsDark = useTheme().palette.mode === "dark";

  return (
    <Stack height="100vh">
      <InitiativeHeader
        subtitle={
          initiativeItems.length === 0
            ? "Select a character to start initiative"
            : undefined
        }
        action={
          <>
            <Tooltip
              arrow
              placement="bottom"
              title={
                <>
                  <div>ЛКМ — выбрать токен</div>
                  <div>ПКМ — добавить в инициативу</div>
                  <div>Стрелки — смена хода</div>
                </>
              }
            >
              <IconButton>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>

            {role === "GM" && <SettingsButton />}

            <IconButton onClick={handleSortClick}>
              <Icon>
                {sortAscending ? (
                  <SortAscendingIcon darkMode={themeIsDark} />
                ) : (
                  <SortDescendingIcon darkMode={themeIsDark} />
                )}
              </Icon>
            </IconButton>

            {!advancedControls && (
              <IconButton
                onClick={() => handleDirectionClick()}
                disabled={initiativeItems.length === 0}
              >
                <SkipNextRounded />
              </IconButton>
            )}
          </>
        }
      />

      <Box sx={{ overflowY: "auto" }}>
        <HeightMonitor
          onChange={(height) =>
            OBR.action.setHeight(66 + Math.max(64, height))
          }
        >
          <List>
            {sortedInitiativeItems.map((item) => (
              <InitiativeListItem
                key={item.id}
                item={item}
                onCountChange={(newCount) =>
                  handleInitiativeCountChange(item.id, newCount)
                }
                showHidden={role === "GM"}
                selected={selection.includes(item.id)}
              />
            ))}
          </List>
        </HeightMonitor>
      </Box>
    </Stack>
  );
}
