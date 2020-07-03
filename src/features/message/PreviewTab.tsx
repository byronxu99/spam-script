import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectMessageTemplate } from "./messageSlice";
import { selectParsedData } from "../data/dataSlice";
import { makeSpamObject, makeMessageTemplater } from "../../utils/templating";
import MessagePreview from "./MessagePreview";

export default function PreviewTab() {
  const template = useSelector(selectMessageTemplate);
  const data = useSelector(selectParsedData);

  const templater = useMemo(() => makeMessageTemplater(template), [template]);
  const spam = useMemo(() => makeSpamObject(data, 0), [data]);
  const preview = templater(spam);

  //const preview = template;

  return <MessagePreview message={preview} />;
}
