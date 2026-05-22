"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  Activity,
  ArrowUpDown,
  Bot,
  BoxSelect,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Filter,
  Flag,
  Folders,
  Hash,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutList,
  MessageSquare,
  MoreHorizontal,
  Phone,
  PieChart,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  Settings,
  Share,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
  Users,
  Workflow,
  X,
} from "lucide-react";

type AppState = "board" | "clients" | "docs" | "chat" | "team" | "dashboards" | "forms";
type TaskStatus = "todo" | "planning" | "in_progress" | "risk" | "done";
type Priority = "low" | "medium" | "high" | "urgent";
type ClientStage = "lead" | "qualified" | "proposal" | "won" | "lost";
type SyncStatus = "local" | "loading" | "synced" | "error";

type TaskComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

type CrmTask = {
  id: string;
  title: string;
  client: string;
  assignee: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  description: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
  comments: TaskComment[];
};

type ClientRecord = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  stage: ClientStage;
  value: number;
  owner: string;
  notes: string;
  updatedAt: string;
};

type DocRecord = {
  id: string;
  title: string;
  space: string;
  content: string;
  favorite: boolean;
  updatedAt: string;
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "online" | "busy" | "offline";
};

type ChatMessage = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

type DashboardCard = {
  id: string;
  title: string;
  value: string;
};

type FormSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type FormRecord = {
  id: string;
  title: string;
  type: string;
  description: string;
  submissions: FormSubmission[];
  updatedAt: string;
};

const TASK_STATUSES: Array<{ id: TaskStatus; label: string; className: string }> = [
  { id: "todo", label: "TO DO", className: "status-todo" },
  { id: "planning", label: "PLANEJAMENTO", className: "status-planning" },
  { id: "in_progress", label: "EM ANDAMENTO", className: "status-inprogress" },
  { id: "risk", label: "RISCO", className: "status-risk" },
  { id: "done", label: "CONCLUIDO", className: "status-done" },
];

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

const CLIENT_STAGES: Array<{ id: ClientStage; label: string }> = [
  { id: "lead", label: "Lead" },
  { id: "qualified", label: "Qualificado" },
  { id: "proposal", label: "Proposta" },
  { id: "won", label: "Fechado" },
  { id: "lost", label: "Perdido" },
];

const WORKSPACE_ID = "grx-intelligence";

const DEFAULT_TASKS: CrmTask[] = [
  {
    id: "task-crm-clickup",
    title: "Criar CRM GRX Intelligence",
    client: "GRX Intelligence",
    assignee: "Gustavo Roque",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-05-20",
    description: "Transformar o prototipo em um CRM com CRUD, pipeline, documentos e painel.",
    tag: "GRX",
    createdAt: "2026-05-17T20:00:00.000Z",
    updatedAt: "2026-05-17T22:00:00.000Z",
    comments: [
      {
        id: "comment-1",
        author: "Gustavo Roque",
        body: "Base criada no Gemini/Antigravity e separada do ERP Notas.",
        createdAt: "2026-05-17T22:15:00.000Z",
      },
    ],
  },
  {
    id: "task-pipeline",
    title: "Configurar pipeline comercial",
    client: "Roque Shop",
    assignee: "Danielle",
    status: "planning",
    priority: "medium",
    dueDate: "2026-05-23",
    description: "Criar etapas, campos e playbook de acompanhamento para clientes.",
    tag: "CRM",
    createdAt: "2026-05-17T19:00:00.000Z",
    updatedAt: "2026-05-17T21:00:00.000Z",
    comments: [],
  },
  {
    id: "task-supabase",
    title: "Modelar tabelas do Supabase",
    client: "GRX Intelligence",
    assignee: "Leonardo Avallone",
    status: "todo",
    priority: "urgent",
    dueDate: "2026-05-19",
    description: "Definir schema, RLS e politicas antes de levar o CRUD para producao.",
    tag: "DB",
    createdAt: "2026-05-17T18:00:00.000Z",
    updatedAt: "2026-05-17T18:30:00.000Z",
    comments: [],
  },
];

const DEFAULT_CLIENTS: ClientRecord[] = [
  {
    id: "client-grx",
    name: "GRX Intelligence",
    contact: "Gustavo Roque",
    email: "contato@grxintelligence.com",
    phone: "(11) 99999-0000",
    stage: "won",
    value: 18000,
    owner: "Gustavo Roque",
    notes: "Workspace interno para operacao comercial, tarefas e documentacao.",
    updatedAt: "2026-05-17T22:00:00.000Z",
  },
  {
    id: "client-roque-shop",
    name: "Roque Shop",
    contact: "Danielle",
    email: "danielle@example.com",
    phone: "(11) 98888-0000",
    stage: "proposal",
    value: 7200,
    owner: "Danielle",
    notes: "Proposta de automacao e dashboard comercial.",
    updatedAt: "2026-05-16T13:00:00.000Z",
  },
  {
    id: "client-visa-x",
    name: "Visa X Consulting",
    contact: "Leonardo Avallone",
    email: "leo@example.com",
    phone: "(11) 97777-0000",
    stage: "qualified",
    value: 12500,
    owner: "Leonardo Avallone",
    notes: "Cliente qualificado aguardando escopo final.",
    updatedAt: "2026-05-15T10:00:00.000Z",
  },
];

const DEFAULT_DOCS: DocRecord[] = [
  {
    id: "doc-playbook",
    title: "Playbook CRM GRX",
    space: "GRX Intelligence",
    content:
      "Processo comercial:\n\n1. Registrar lead.\n2. Qualificar oportunidade.\n3. Criar tarefas de follow-up.\n4. Atualizar dashboard semanalmente.",
    favorite: true,
    updatedAt: "2026-05-17T22:00:00.000Z",
  },
  {
    id: "doc-briefing",
    title: "Briefing de cliente",
    space: "Modelos",
    content: "Nome do cliente:\nObjetivo:\nCanais:\nPrazos:\nResponsaveis:",
    favorite: false,
    updatedAt: "2026-05-16T18:00:00.000Z",
  },
];

const DEFAULT_TEAM: TeamMember[] = [
  { id: "member-gustavo", name: "Gustavo Roque", role: "Owner", email: "gustavo@grxintelligence.com", status: "online" },
  { id: "member-danielle", name: "Danielle", role: "CRM Ops", email: "danielle@example.com", status: "busy" },
  { id: "member-leonardo", name: "Leonardo Avallone", role: "Desenvolvimento", email: "leonardo@example.com", status: "offline" },
];

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    author: "Danielle",
    body: "O CRM separado ja esta pronto para receber o CRUD.",
    createdAt: "2026-05-17T22:25:00.000Z",
  },
  {
    id: "msg-2",
    author: "Gustavo Roque",
    body: "Perfeito, vamos ligar tarefas, clientes, docs e dashboards.",
    createdAt: "2026-05-17T22:28:00.000Z",
  },
];

const DEFAULT_FORMS: FormRecord[] = [
  {
    id: "form-intake",
    title: "Entrada de Projeto",
    type: "Project Intake",
    description: "Captura demandas novas de clientes e oportunidades.",
    submissions: [],
    updatedAt: "2026-05-17T21:00:00.000Z",
  },
  {
    id: "form-feedback",
    title: "Feedback de Cliente",
    type: "Feedback",
    description: "Coleta feedbacks depois de entregas e reunioes.",
    submissions: [],
    updatedAt: "2026-05-17T21:20:00.000Z",
  },
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
  maximumFractionDigits: 0,
});

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatDate(value: string) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function readFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readFormNumber(formData: FormData, key: string) {
  const value = Number(readFormString(formData, key));
  return Number.isFinite(value) ? value : 0;
}

function getGlobalSyncStatus(statuses: SyncStatus[]) {
  if (!isSupabaseConfigured) return "local";
  if (statuses.includes("loading")) return "loading";
  if (statuses.includes("error")) return "error";
  return "synced";
}

function useStoredState<T>(storageKey: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return initialValue;

    try {
      return JSON.parse(stored) as T;
    } catch {
      return initialValue;
    }
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSupabaseConfigured ? "loading" : "local");
  const remoteReadyRef = useRef(!isSupabaseConfigured);

  useEffect(() => {
    let cancelled = false;

    async function loadRemoteState() {
      if (!supabase || !isSupabaseConfigured) return;

      const { data, error } = await supabase
        .from("crm_workspace_state")
        .select("data")
        .eq("workspace_id", WORKSPACE_ID)
        .eq("state_key", storageKey)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.warn(`Supabase sync disabled for ${storageKey}:`, error.message);
        remoteReadyRef.current = true;
        setSyncStatus("error");
        return;
      }

      if (data?.data) {
        const remoteValue = data.data as T;
        setValue(remoteValue);
        window.localStorage.setItem(storageKey, JSON.stringify(remoteValue));
      }

      remoteReadyRef.current = true;
      setSyncStatus("synced");
    }

    void loadRemoteState();

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured || !remoteReadyRef.current) return;

    const client = supabase;
    const timeoutId = window.setTimeout(async () => {
      const { error } = await client.from("crm_workspace_state").upsert(
        {
          workspace_id: WORKSPACE_ID,
          state_key: storageKey,
          data: value,
          updated_at: nowIso(),
        },
        { onConflict: "workspace_id,state_key" },
      );

      if (error) {
        console.warn(`Supabase sync failed for ${storageKey}:`, error.message);
        setSyncStatus("error");
        return;
      }

      setSyncStatus("synced");
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [storageKey, value]);

  return [value, setValue, syncStatus] as const;
}

export default function CrmGrxWorkspace() {
  const [activeApp, setActiveApp] = useState<AppState>("board");
  const [toast, setToast] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [sortTasksBy, setSortTasksBy] = useState<"updated" | "due" | "title">("updated");
  const [showClosed, setShowClosed] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string>("form-intake");
  const [taskModal, setTaskModal] = useState<{ mode: "create" | "edit"; task?: CrmTask; status?: TaskStatus } | null>(null);
  const [clientModal, setClientModal] = useState<{ mode: "create" | "edit"; client?: ClientRecord } | null>(null);
  const [memberModal, setMemberModal] = useState<{ mode: "create" | "edit"; member?: TeamMember } | null>(null);
  const [formModal, setFormModal] = useState<{ mode: "create" | "edit"; form?: FormRecord } | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(nowIso());

  const [tasks, setTasks, tasksSyncStatus] = useStoredState<CrmTask[]>("grx-crm.tasks", DEFAULT_TASKS);
  const [clients, setClients, clientsSyncStatus] = useStoredState<ClientRecord[]>("grx-crm.clients", DEFAULT_CLIENTS);
  const [docs, setDocs, docsSyncStatus] = useStoredState<DocRecord[]>("grx-crm.docs", DEFAULT_DOCS);
  const [team, setTeam, teamSyncStatus] = useStoredState<TeamMember[]>("grx-crm.team", DEFAULT_TEAM);
  const [messages, setMessages, messagesSyncStatus] = useStoredState<ChatMessage[]>("grx-crm.messages", DEFAULT_MESSAGES);
  const [forms, setForms, formsSyncStatus] = useStoredState<FormRecord[]>("grx-crm.forms", DEFAULT_FORMS);
  const [dashboardCards, setDashboardCards, dashboardSyncStatus] = useStoredState<DashboardCard[]>(
    "grx-crm.dashboardCards",
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const selectedDoc = docs.find((doc) => doc.id === selectedDocId) ?? null;
  const selectedForm = forms.find((form) => form.id === selectedFormId) ?? forms[0] ?? null;
  const syncStatus = getGlobalSyncStatus([
    tasksSyncStatus,
    clientsSyncStatus,
    docsSyncStatus,
    teamSyncStatus,
    messagesSyncStatus,
    formsSyncStatus,
    dashboardSyncStatus,
  ]);

  const openApp = (app: AppState) => {
    setActiveApp(app);
    setSelectedTaskId(null);
    if (app !== "docs") setSelectedDocId(null);
  };

  const notify = (message: string) => setToast(message);

  const saveTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = taskModal?.task?.id ?? createId("task");
    const updatedTask: CrmTask = {
      id,
      title: readFormString(formData, "title") || "Nova tarefa",
      client: readFormString(formData, "client") || "GRX Intelligence",
      assignee: readFormString(formData, "assignee") || "Gustavo Roque",
      status: readFormString(formData, "status") as TaskStatus,
      priority: readFormString(formData, "priority") as Priority,
      dueDate: readFormString(formData, "dueDate"),
      description: readFormString(formData, "description"),
      tag: readFormString(formData, "tag") || "CRM",
      createdAt: taskModal?.task?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
      comments: taskModal?.task?.comments ?? [],
    };

    setTasks((currentTasks) => {
      const exists = currentTasks.some((task) => task.id === id);
      return exists ? currentTasks.map((task) => (task.id === id ? updatedTask : task)) : [updatedTask, ...currentTasks];
    });
    setSelectedTaskId(id);
    setTaskModal(null);
    notify(taskModal?.mode === "edit" ? "Tarefa atualizada." : "Tarefa criada.");
  };

  const duplicateTask = (task: CrmTask) => {
    const duplicatedTask: CrmTask = {
      ...task,
      id: createId("task"),
      title: `${task.title} (copia)`,
      status: "todo",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      comments: [],
    };
    setTasks((currentTasks) => [duplicatedTask, ...currentTasks]);
    notify("Tarefa duplicada.");
  };

  const deleteTask = (taskId: string) => {
    const canDelete = window.confirm("Excluir esta tarefa?");
    if (!canDelete) return;
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
    notify("Tarefa excluida.");
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status, updatedAt: nowIso() } : task)),
    );
    notify("Status atualizado.");
  };

  const addTaskComment = (taskId: string, body: string) => {
    const text = body.trim();
    if (!text) return;
    const comment: TaskComment = {
      id: createId("comment"),
      author: "Gustavo Roque",
      body: text,
      createdAt: nowIso(),
    };
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, comments: [...task.comments, comment], updatedAt: nowIso() } : task,
      ),
    );
    notify("Comentario adicionado.");
  };

  const saveClient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = clientModal?.client?.id ?? createId("client");
    const client: ClientRecord = {
      id,
      name: readFormString(formData, "name") || "Novo cliente",
      contact: readFormString(formData, "contact") || "Contato principal",
      email: readFormString(formData, "email"),
      phone: readFormString(formData, "phone"),
      stage: readFormString(formData, "stage") as ClientStage,
      value: readFormNumber(formData, "value"),
      owner: readFormString(formData, "owner") || "Gustavo Roque",
      notes: readFormString(formData, "notes"),
      updatedAt: nowIso(),
    };

    setClients((currentClients) => {
      const exists = currentClients.some((currentClient) => currentClient.id === id);
      return exists
        ? currentClients.map((currentClient) => (currentClient.id === id ? client : currentClient))
        : [client, ...currentClients];
    });
    setClientModal(null);
    notify(clientModal?.mode === "edit" ? "Cliente atualizado." : "Cliente criado.");
  };

  const deleteClient = (clientId: string) => {
    const canDelete = window.confirm("Excluir este cliente?");
    if (!canDelete) return;
    setClients((currentClients) => currentClients.filter((client) => client.id !== clientId));
    notify("Cliente excluido.");
  };

  const updateClientStage = (clientId: string, stage: ClientStage) => {
    setClients((currentClients) =>
      currentClients.map((client) => (client.id === clientId ? { ...client, stage, updatedAt: nowIso() } : client)),
    );
    notify("Etapa do cliente atualizada.");
  };

  const createDoc = (template?: Partial<DocRecord>) => {
    const doc: DocRecord = {
      id: createId("doc"),
      title: template?.title ?? "Novo documento",
      space: template?.space ?? "GRX Intelligence",
      content: template?.content ?? "Escreva aqui...",
      favorite: template?.favorite ?? false,
      updatedAt: nowIso(),
    };
    setDocs((currentDocs) => [doc, ...currentDocs]);
    setSelectedDocId(doc.id);
    setActiveApp("docs");
    notify("Documento criado.");
  };

  const saveDoc = (event: FormEvent<HTMLFormElement>, docId: string) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setDocs((currentDocs) =>
      currentDocs.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              title: readFormString(formData, "title") || "Documento sem titulo",
              space: readFormString(formData, "space") || "GRX Intelligence",
              content: readFormString(formData, "content"),
              updatedAt: nowIso(),
            }
          : doc,
      ),
    );
    notify("Documento salvo.");
  };

  const deleteDoc = (docId: string) => {
    const canDelete = window.confirm("Excluir este documento?");
    if (!canDelete) return;
    setDocs((currentDocs) => currentDocs.filter((doc) => doc.id !== docId));
    setSelectedDocId(null);
    notify("Documento excluido.");
  };

  const toggleDocFavorite = (docId: string) => {
    setDocs((currentDocs) =>
      currentDocs.map((doc) => (doc.id === docId ? { ...doc, favorite: !doc.favorite, updatedAt: nowIso() } : doc)),
    );
  };

  const saveMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = memberModal?.member?.id ?? createId("member");
    const member: TeamMember = {
      id,
      name: readFormString(formData, "name") || "Novo membro",
      role: readFormString(formData, "role") || "Colaborador",
      email: readFormString(formData, "email"),
      status: readFormString(formData, "status") as TeamMember["status"],
    };
    setTeam((currentTeam) => {
      const exists = currentTeam.some((currentMember) => currentMember.id === id);
      return exists
        ? currentTeam.map((currentMember) => (currentMember.id === id ? member : currentMember))
        : [member, ...currentTeam];
    });
    setMemberModal(null);
    notify(memberModal?.mode === "edit" ? "Membro atualizado." : "Membro convidado.");
  };

  const deleteMember = (memberId: string) => {
    const canDelete = window.confirm("Remover este membro?");
    if (!canDelete) return;
    setTeam((currentTeam) => currentTeam.filter((member) => member.id !== memberId));
    notify("Membro removido.");
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = readFormString(formData, "body");
    if (!body) return;
    const message: ChatMessage = {
      id: createId("msg"),
      author: "Gustavo Roque",
      body,
      createdAt: nowIso(),
    };
    setMessages((currentMessages) => [...currentMessages, message]);
    form.reset();
    notify("Mensagem enviada.");
  };

  const saveForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = formModal?.form?.id ?? createId("form");
    const formRecord: FormRecord = {
      id,
      title: readFormString(formData, "title") || "Novo formulario",
      type: readFormString(formData, "type") || "Personalizado",
      description: readFormString(formData, "description"),
      submissions: formModal?.form?.submissions ?? [],
      updatedAt: nowIso(),
    };

    setForms((currentForms) => {
      const exists = currentForms.some((currentForm) => currentForm.id === id);
      return exists
        ? currentForms.map((currentForm) => (currentForm.id === id ? formRecord : currentForm))
        : [formRecord, ...currentForms];
    });
    setSelectedFormId(id);
    setFormModal(null);
    notify(formModal?.mode === "edit" ? "Formulario atualizado." : "Formulario criado.");
  };

  const deleteForm = (formId: string) => {
    const canDelete = window.confirm("Excluir este formulario?");
    if (!canDelete) return;
    setForms((currentForms) => currentForms.filter((form) => form.id !== formId));
    setSelectedFormId((currentId) => (currentId === formId ? forms.find((form) => form.id !== formId)?.id ?? "" : currentId));
    notify("Formulario excluido.");
  };

  const submitFormResponse = (event: FormEvent<HTMLFormElement>, formId: string) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const submission: FormSubmission = {
      id: createId("submission"),
      name: readFormString(formData, "name") || "Lead sem nome",
      email: readFormString(formData, "email"),
      message: readFormString(formData, "message"),
      createdAt: nowIso(),
    };
    setForms((currentForms) =>
      currentForms.map((form) =>
        form.id === formId
          ? { ...form, submissions: [submission, ...form.submissions], updatedAt: nowIso() }
          : form,
      ),
    );
    formElement.reset();
    notify("Resposta registrada.");
  };

  const createTemplateForm = (title: string, type: string, description: string) => {
    const formRecord: FormRecord = {
      id: createId("form"),
      title,
      type,
      description,
      submissions: [],
      updatedAt: nowIso(),
    };
    setForms((currentForms) => [formRecord, ...currentForms]);
    setSelectedFormId(formRecord.id);
    notify("Modelo adicionado.");
  };

  const addDashboardCard = () => {
    const card: DashboardCard = {
      id: createId("card"),
      title: "Metrica personalizada",
      value: String(tasks.filter((task) => task.status !== "done").length),
    };
    setDashboardCards((currentCards) => [card, ...currentCards]);
    notify("Card adicionado ao dashboard.");
  };

  const deleteDashboardCard = (cardId: string) => {
    setDashboardCards((currentCards) => currentCards.filter((card) => card.id !== cardId));
    notify("Card removido.");
  };

  const filteredTasks = useMemo(() => {
    const query = taskSearch.toLowerCase();
    return tasks
      .filter((task) => showClosed || task.status !== "done")
      .filter((task) => {
        const haystack = `${task.title} ${task.client} ${task.assignee} ${task.tag}`.toLowerCase();
        return haystack.includes(query);
      })
      .sort((firstTask, secondTask) => {
        if (sortTasksBy === "title") return firstTask.title.localeCompare(secondTask.title);
        if (sortTasksBy === "due") return firstTask.dueDate.localeCompare(secondTask.dueDate);
        return secondTask.updatedAt.localeCompare(firstTask.updatedAt);
      });
  }, [showClosed, sortTasksBy, taskSearch, tasks]);

  const filteredClients = useMemo(() => {
    const query = clientSearch.toLowerCase();
    return clients.filter((client) => `${client.name} ${client.contact} ${client.email}`.toLowerCase().includes(query));
  }, [clientSearch, clients]);

  const filteredDocs = useMemo(() => {
    const query = docSearch.toLowerCase();
    return docs.filter((doc) => `${doc.title} ${doc.space} ${doc.content}`.toLowerCase().includes(query));
  }, [docSearch, docs]);

  const filteredTeam = useMemo(() => {
    const query = chatSearch.toLowerCase();
    return team.filter((member) => `${member.name} ${member.role} ${member.email}`.toLowerCase().includes(query));
  }, [chatSearch, team]);

  const activeDeals = clients.filter((client) => !["won", "lost"].includes(client.stage));
  const totalPipeline = clients.reduce((sum, client) => sum + client.value, 0);
  const totalSubmissions = forms.reduce((sum, form) => sum + form.submissions.length, 0);

  return (
    <div className="app-layout">
      <AppSidebar
        activeApp={activeApp}
        onNavigate={openApp}
        onInvite={() => {
          openApp("team");
          setMemberModal({ mode: "create" });
        }}
        onMore={() => notify("Menu rapido: CRM, calendario, templates e configuracoes.")}
      />

      <WorkspaceSidebar
        activeApp={activeApp}
        tasks={tasks}
        clients={clients}
        docs={docs}
        forms={forms}
        onNavigate={openApp}
        onCreateTask={() => setTaskModal({ mode: "create", status: "todo" })}
        onCreateClient={() => setClientModal({ mode: "create" })}
        onCreateDoc={() => createDoc()}
        onCreateForm={() => setFormModal({ mode: "create" })}
      />

      {activeApp === "board" && !selectedTask && (
        <BoardView
          tasks={filteredTasks}
          allTasks={tasks}
          search={taskSearch}
          sortTasksBy={sortTasksBy}
          showClosed={showClosed}
          onSearch={setTaskSearch}
          onSortChange={setSortTasksBy}
          onToggleClosed={() => setShowClosed((current) => !current)}
          onCreateTask={(status) => setTaskModal({ mode: "create", status })}
          onOpenTask={setSelectedTaskId}
          onEditTask={(task) => setTaskModal({ mode: "edit", task })}
          onDeleteTask={deleteTask}
          onDuplicateTask={duplicateTask}
          onStatusChange={updateTaskStatus}
          onNotify={notify}
        />
      )}

      {activeApp === "board" && selectedTask && (
        <TaskDetail
          task={selectedTask}
          team={team}
          onBack={() => setSelectedTaskId(null)}
          onEdit={() => setTaskModal({ mode: "edit", task: selectedTask })}
          onDelete={() => deleteTask(selectedTask.id)}
          onDuplicate={() => duplicateTask(selectedTask)}
          onStatusChange={(status) => updateTaskStatus(selectedTask.id, status)}
          onComment={(body) => addTaskComment(selectedTask.id, body)}
          onNotify={notify}
        />
      )}

      {activeApp === "clients" && (
        <ClientsView
          clients={filteredClients}
          search={clientSearch}
          pipelineValue={totalPipeline}
          activeDeals={activeDeals.length}
          onSearch={setClientSearch}
          onCreateClient={() => setClientModal({ mode: "create" })}
          onEditClient={(client) => setClientModal({ mode: "edit", client })}
          onDeleteClient={deleteClient}
          onStageChange={updateClientStage}
          onNotify={notify}
        />
      )}

      {activeApp === "docs" && (
        <DocsView
          docs={filteredDocs}
          selectedDoc={selectedDoc}
          search={docSearch}
          onSearch={setDocSearch}
          onCreateDoc={() => createDoc()}
          onImport={() =>
            createDoc({
              title: "Documento importado",
              space: "Importados",
              content: "Conteudo importado manualmente. Edite este doc para colar o material real.",
            })
          }
          onOpenDoc={setSelectedDocId}
          onBack={() => setSelectedDocId(null)}
          onSaveDoc={saveDoc}
          onDeleteDoc={deleteDoc}
          onToggleFavorite={toggleDocFavorite}
        />
      )}

      {activeApp === "chat" && (
        <ChatView
          messages={messages}
          team={filteredTeam}
          bannerVisible={bannerVisible}
          search={chatSearch}
          onSearch={setChatSearch}
          onDismissBanner={() => setBannerVisible(false)}
          onSendMessage={sendMessage}
          onOpenProfile={() => {
            openApp("team");
            notify("Perfil aberto no modulo Time.");
          }}
          onCreateChannel={() => notify("Canal criado para o workspace GRX.")}
        />
      )}

      {activeApp === "team" && (
        <TeamView
          team={team}
          onCreateMember={() => setMemberModal({ mode: "create" })}
          onEditMember={(member) => setMemberModal({ mode: "edit", member })}
          onDeleteMember={deleteMember}
        />
      )}

      {activeApp === "dashboards" && (
        <DashboardsView
          tasks={tasks}
          clients={clients}
          forms={forms}
          cards={dashboardCards}
          refreshedAt={refreshedAt}
          editMode={editMode}
          onToggleEditMode={() => setEditMode((current) => !current)}
          onRefresh={() => {
            setRefreshedAt(nowIso());
            notify("Dashboard atualizado.");
          }}
          onAddCard={addDashboardCard}
          onDeleteCard={deleteDashboardCard}
        />
      )}

      {activeApp === "forms" && (
        <FormsView
          forms={forms}
          selectedForm={selectedForm}
          totalSubmissions={totalSubmissions}
          onSelectForm={setSelectedFormId}
          onCreateForm={() => setFormModal({ mode: "create" })}
          onEditForm={(form) => setFormModal({ mode: "edit", form })}
          onDeleteForm={deleteForm}
          onSubmitResponse={submitFormResponse}
          onCreateTemplate={createTemplateForm}
        />
      )}

      {taskModal && (
        <TaskModal
          modal={taskModal}
          clients={clients}
          team={team}
          onClose={() => setTaskModal(null)}
          onSubmit={saveTask}
        />
      )}

      {clientModal && <ClientModal modal={clientModal} onClose={() => setClientModal(null)} onSubmit={saveClient} />}

      {memberModal && <MemberModal modal={memberModal} onClose={() => setMemberModal(null)} onSubmit={saveMember} />}

      {formModal && <FormModal modal={formModal} onClose={() => setFormModal(null)} onSubmit={saveForm} />}

      <SyncIndicator status={syncStatus} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AppSidebar({
  activeApp,
  onNavigate,
  onInvite,
  onMore,
}: {
  activeApp: AppState;
  onNavigate: (app: AppState) => void;
  onInvite: () => void;
  onMore: () => void;
}) {
  const navItems = [
    { id: "board" as AppState, label: "Home", icon: Home },
    { id: "clients" as AppState, label: "CRM", icon: Folders },
    { id: "chat" as AppState, label: "Chat", icon: MessageSquare },
    { id: "docs" as AppState, label: "Docs", icon: FileText },
    { id: "team" as AppState, label: "Team", icon: Users },
    { id: "dashboards" as AppState, label: "Dash", icon: LayoutDashboard },
    { id: "forms" as AppState, label: "Forms", icon: BoxSelect },
  ];

  return (
    <nav className="app-sidebar">
      <button className="avatar-badge" onClick={() => onNavigate("board")} title="GRX Intelligence">
        G
        <span className="notification-dot">4</span>
      </button>

      <div className="app-nav-stack">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`app-icon ${activeApp === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button className="app-icon" onClick={onMore} title="Mais opcoes">
          <MoreHorizontal size={22} strokeWidth={1.5} />
          <span>More</span>
        </button>
      </div>

      <div className="app-sidebar-bottom">
        <button className="app-icon" onClick={onInvite} title="Convidar membro">
          <UserPlus size={22} strokeWidth={1.5} />
          <span>Invite</span>
        </button>
      </div>
    </nav>
  );
}

function WorkspaceSidebar({
  activeApp,
  tasks,
  clients,
  docs,
  forms,
  onNavigate,
  onCreateTask,
  onCreateClient,
  onCreateDoc,
  onCreateForm,
}: {
  activeApp: AppState;
  tasks: CrmTask[];
  clients: ClientRecord[];
  docs: DocRecord[];
  forms: FormRecord[];
  onNavigate: (app: AppState) => void;
  onCreateTask: () => void;
  onCreateClient: () => void;
  onCreateDoc: () => void;
  onCreateForm: () => void;
}) {
  const overdueCount = tasks.filter((task) => task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date()).length;
  const openTasks = tasks.filter((task) => task.status !== "done").length;
  const wonClients = clients.filter((client) => client.stage === "won").length;

  return (
    <aside className="space-sidebar">
      <div className="space-header">
        <div>
          <h1>GRX CRM</h1>
          <span className="sidebar-subtitle">Workspace comercial</span>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={onCreateTask} title="Nova tarefa">
            <Plus size={16} />
          </button>
          <button className="btn-icon" onClick={() => onNavigate("dashboards")} title="Configuracoes">
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="sidebar-card">
        <div className="sidebar-card-row">
          <span>Tarefas abertas</span>
          <strong>{openTasks}</strong>
        </div>
        <div className="sidebar-card-row">
          <span>Clientes ganhos</span>
          <strong>{wonClients}</strong>
        </div>
        <div className="sidebar-card-row danger">
          <span>Atrasadas</span>
          <strong>{overdueCount}</strong>
        </div>
      </div>

      <div className="nav-section">
        <button className={`nav-item-button ${activeApp === "board" ? "active" : ""}`} onClick={() => onNavigate("board")}>
          <CheckSquare className="icon" size={16} /> Tarefas e Pipeline <span>{tasks.length}</span>
        </button>
        <button className={`nav-item-button ${activeApp === "clients" ? "active" : ""}`} onClick={() => onNavigate("clients")}>
          <Building2 className="icon" size={16} /> Clientes <span>{clients.length}</span>
        </button>
        <button className={`nav-item-button ${activeApp === "docs" ? "active" : ""}`} onClick={() => onNavigate("docs")}>
          <FileText className="icon" size={16} /> Documentos <span>{docs.length}</span>
        </button>
        <button className={`nav-item-button ${activeApp === "chat" ? "active" : ""}`} onClick={() => onNavigate("chat")}>
          <Hash className="icon" size={16} /> Conversas <span>1</span>
        </button>
        <button className={`nav-item-button ${activeApp === "team" ? "active" : ""}`} onClick={() => onNavigate("team")}>
          <Users className="icon" size={16} /> Time
        </button>
        <button className={`nav-item-button ${activeApp === "dashboards" ? "active" : ""}`} onClick={() => onNavigate("dashboards")}>
          <LayoutDashboard className="icon" size={16} /> Dashboard
        </button>
        <button className={`nav-item-button ${activeApp === "forms" ? "active" : ""}`} onClick={() => onNavigate("forms")}>
          <BoxSelect className="icon" size={16} /> Formularios <span>{forms.length}</span>
        </button>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Acoes rapidas</div>
        <button className="nav-item-button muted" onClick={onCreateClient}>
          <Plus size={14} /> Novo cliente
        </button>
        <button className="nav-item-button muted" onClick={onCreateDoc}>
          <Plus size={14} /> Novo doc
        </button>
        <button className="nav-item-button muted" onClick={onCreateForm}>
          <Plus size={14} /> Novo formulario
        </button>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Spaces</div>
        {["GRX Intelligence", "Roque Shop", "Visa X Consulting", "PsicoRed", "Coast Riviera"].map((space, index) => (
          <button key={space} className="space-item-button" onClick={() => onNavigate(index === 0 ? "board" : "clients")}>
            <div className="space-avatar" style={{ background: ["#10b981", "#ea580c", "#ec4899", "#0ea5e9", "#6366f1"][index] }}>
              {space[0]}
            </div>
            <span>{space}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function BoardView({
  tasks,
  allTasks,
  search,
  sortTasksBy,
  showClosed,
  onSearch,
  onSortChange,
  onToggleClosed,
  onCreateTask,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onStatusChange,
  onNotify,
}: {
  tasks: CrmTask[];
  allTasks: CrmTask[];
  search: string;
  sortTasksBy: "updated" | "due" | "title";
  showClosed: boolean;
  onSearch: (value: string) => void;
  onSortChange: (value: "updated" | "due" | "title") => void;
  onToggleClosed: () => void;
  onCreateTask: (status: TaskStatus) => void;
  onOpenTask: (taskId: string) => void;
  onEditTask: (task: CrmTask) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: CrmTask) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onNotify: (message: string) => void;
}) {
  const openTasks = allTasks.filter((task) => task.status !== "done").length;

  return (
    <main className="main-area">
      <TopBar
        title="GRX Intelligence"
        subtitle={`${openTasks} tarefas abertas`}
        search={search}
        onSearch={onSearch}
        searchPlaceholder="Buscar tarefa, cliente ou responsavel"
        onNotify={onNotify}
      />

      <nav className="view-tabs-bar">
        <button className="view-tab active">
          <LayoutDashboard size={14} color="#3b82f6" /> Board
        </button>
        <button className="view-tab" onClick={() => onNotify("Lista compacta ativada no board.")}>
          <LayoutList size={14} /> List
        </button>
        <button className="view-tab" onClick={() => onNotify("Calendario usa os prazos das tarefas.")}>
          <CalendarDays size={14} /> Calendar
        </button>
        <button className="view-tab" onClick={() => onNotify("Gantt sera derivado das datas de inicio e entrega.")}>
          <Activity size={14} /> Gantt
        </button>
        <button className="view-tab" onClick={() => onNotify("Visao por time usa os responsaveis das tarefas.")}>
          <Users size={14} /> Team
        </button>
      </nav>

      <div className="action-bar">
        <div className="filter-group">
          <button className="filter-pill active">
            <LayoutDashboard size={14} /> Grupo: Status
          </button>
          <button className="filter-pill" onClick={() => onNotify("Subtarefas serao vinculadas ao detalhe da tarefa.")}>
            <Workflow size={14} /> Subtasks
          </button>
        </div>
        <div className="filter-group">
          <label className="select-shell">
            <ArrowUpDown size={14} />
            <select value={sortTasksBy} onChange={(event) => onSortChange(event.target.value as "updated" | "due" | "title")}>
              <option value="updated">Atualizacao</option>
              <option value="due">Prazo</option>
              <option value="title">Titulo</option>
            </select>
          </label>
          <button className="btn-solid" onClick={onToggleClosed}>
            <Filter size={14} /> {showClosed ? "Ocultar concluidas" : "Mostrar concluidas"}
          </button>
          <button className="btn-primary" onClick={() => onCreateTask("todo")}>
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>

      <div className="board-container">
        {TASK_STATUSES.map((status) => {
          const statusTasks = tasks.filter((task) => task.status === status.id);
          return (
            <div key={status.id} className="board-column">
              <div className="column-header">
                <div className="column-title">
                  <span className={`status-label ${status.className}`}>{status.label}</span>
                  <span className="text-secondary text-xs font-semibold">{statusTasks.length}</span>
                </div>
                <button className="btn-icon" onClick={() => onCreateTask(status.id)} title={`Nova tarefa em ${status.label}`}>
                  <Plus size={14} />
                </button>
              </div>
              <div className="task-list">
                {statusTasks.length === 0 && (
                  <button className="empty-column" onClick={() => onCreateTask(status.id)}>
                    <Plus size={16} /> Criar tarefa
                  </button>
                )}
                {statusTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onOpen={() => onOpenTask(task.id)}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task.id)}
                    onDuplicate={() => onDuplicateTask(task)}
                    onStatusChange={(nextStatus) => onStatusChange(task.id, nextStatus)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function TaskCard({
  task,
  onOpen,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
}: {
  task: CrmTask;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStatusChange: (status: TaskStatus) => void;
}) {
  return (
    <article className="task-card" onClick={onOpen}>
      <div className="card-row">
        <h3 className="task-title">{task.title}</h3>
        <button
          className="btn-icon"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          title="Editar tarefa"
        >
          <Edit size={13} />
        </button>
      </div>
      <p className="task-client">{task.client}</p>
      <div className="task-meta">
        <span className="meta-tag">{task.tag}</span>
        <span className={`priority-dot priority-${task.priority}`}>{task.priority}</span>
        <span className="meta-tag">
          <CalendarDays size={12} /> {formatDate(task.dueDate)}
        </span>
      </div>
      <div className="card-row">
        <span className="assignee-chip">{task.assignee.slice(0, 2).toUpperCase()}</span>
        <select
          className="mini-select"
          value={task.status}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
          title="Mover status"
        >
          {TASK_STATUSES.map((status) => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </select>
        <button
          className="btn-icon danger"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          title="Excluir tarefa"
        >
          <Trash2 size={13} />
        </button>
        <button
          className="btn-icon"
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate();
          }}
          title="Duplicar tarefa"
        >
          <Plus size={13} />
        </button>
      </div>
    </article>
  );
}

function TaskDetail({
  task,
  team,
  onBack,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  onComment,
  onNotify,
}: {
  task: CrmTask;
  team: TeamMember[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onComment: (body: string) => void;
  onNotify: (message: string) => void;
}) {
  const [commentBody, setCommentBody] = useState("");
  const currentStatus = TASK_STATUSES.find((status) => status.id === task.status) ?? TASK_STATUSES[0];

  return (
    <main className="main-area detail-layout">
      <section className="detail-main">
        <header className="top-nav">
          <div className="breadcrumb">
            <button className="btn-icon" onClick={onBack} title="Voltar">
              <ChevronRight className="rotate-180" size={14} />
            </button>
            <LayoutList size={14} className="text-secondary" />
            <span>Pipeline Comercial</span>
            <ChevronRight size={14} className="text-secondary" />
            <span>{task.client}</span>
          </div>
          <div className="top-actions">
            <button className="btn-solid" onClick={() => onNotify("AI gerou um resumo curto para esta tarefa.")}>
              <Bot size={14} /> Ask AI
            </button>
            <button className="btn-solid" onClick={onDuplicate}>
              <Plus size={14} /> Duplicar
            </button>
            <button className="btn-solid" onClick={onEdit}>
              <Edit size={14} /> Editar
            </button>
            <button className="btn-icon danger" onClick={onDelete} title="Excluir">
              <Trash2 size={14} />
            </button>
          </div>
        </header>

        <div className="detail-content">
          <div className="detail-kicker">
            <span className={`status-label ${currentStatus.className}`}>{currentStatus.label}</span>
            <span>{task.id}</span>
          </div>
          <h1 className="detail-title">{task.title}</h1>
          <p className="detail-description">{task.description || "Sem descricao cadastrada."}</p>

          <div className="detail-grid">
            <InfoRow icon={<Building2 size={15} />} label="Cliente" value={task.client} />
            <InfoRow icon={<Users size={15} />} label="Responsavel" value={task.assignee} />
            <InfoRow icon={<CalendarDays size={15} />} label="Prazo" value={formatDate(task.dueDate)} />
            <InfoRow icon={<Flag size={15} />} label="Prioridade" value={task.priority} />
            <InfoRow icon={<Hash size={15} />} label="Tag" value={task.tag} />
            <InfoRow icon={<Clock size={15} />} label="Atualizado" value={formatDateTime(task.updatedAt)} />
          </div>

          <div className="status-switcher">
            {TASK_STATUSES.map((status) => (
              <button
                key={status.id}
                className={`status-option ${task.status === status.id ? "active" : ""}`}
                onClick={() => onStatusChange(status.id)}
              >
                <span className={`status-label ${status.className}`}>{status.label}</span>
              </button>
            ))}
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Responsaveis disponiveis</h3>
              <span>{team.length} pessoas</span>
            </div>
            <div className="chips-row">
              {team.map((member) => (
                <span key={member.id} className="person-chip">
                  {member.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="activity-panel">
        <header className="top-nav compact">
          <span className="font-semibold">Activity</span>
          <button className="btn-icon" onClick={() => onNotify("Busca de atividades ativada.")}>
            <Search size={14} />
          </button>
        </header>

        <div className="activity-feed">
          <ActivityLine label="Tarefa criada" value={formatDateTime(task.createdAt)} />
          <ActivityLine label="Ultima atualizacao" value={formatDateTime(task.updatedAt)} />
          {task.comments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-meta">
                <strong>{comment.author}</strong>
                <span>{formatDateTime(comment.createdAt)}</span>
              </div>
              <p>{comment.body}</p>
            </div>
          ))}
        </div>

        <form
          className="comment-box"
          onSubmit={(event) => {
            event.preventDefault();
            onComment(commentBody);
            setCommentBody("");
          }}
        >
          <textarea
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Write a comment..."
            rows={4}
          />
          <div className="card-row">
            <button type="button" className="btn-icon" onClick={() => setCommentBody((body) => `${body} @Gustavo`)}>
              <Plus size={14} />
            </button>
            <button type="submit" className="btn-primary">
              <Send size={14} /> Enviar
            </button>
          </div>
        </form>
      </aside>
    </main>
  );
}

function ClientsView({
  clients,
  search,
  pipelineValue,
  activeDeals,
  onSearch,
  onCreateClient,
  onEditClient,
  onDeleteClient,
  onStageChange,
  onNotify,
}: {
  clients: ClientRecord[];
  search: string;
  pipelineValue: number;
  activeDeals: number;
  onSearch: (value: string) => void;
  onCreateClient: () => void;
  onEditClient: (client: ClientRecord) => void;
  onDeleteClient: (clientId: string) => void;
  onStageChange: (clientId: string, stage: ClientStage) => void;
  onNotify: (message: string) => void;
}) {
  return (
    <main className="main-area">
      <TopBar
        title="Clientes"
        subtitle={`${clients.length} registros filtrados`}
        search={search}
        onSearch={onSearch}
        searchPlaceholder="Buscar cliente, contato ou email"
        onNotify={onNotify}
      />
      <div className="crm-content">
        <div className="metrics-grid three">
          <MetricCard icon={<DollarSign size={18} />} label="Pipeline total" value={currencyFormatter.format(pipelineValue)} />
          <MetricCard icon={<Activity size={18} />} label="Oportunidades ativas" value={String(activeDeals)} />
          <MetricCard icon={<Building2 size={18} />} label="Clientes listados" value={String(clients.length)} />
        </div>

        <div className="section-header">
          <div>
            <h2>Contas e oportunidades</h2>
            <p>Edite etapas, valores e responsaveis sem sair da tabela.</p>
          </div>
          <button className="btn-primary" onClick={onCreateClient}>
            <Plus size={14} /> Novo cliente
          </button>
        </div>

        <div className="table-card">
          <div className="data-row table-head">
            <span>Cliente</span>
            <span>Contato</span>
            <span>Etapa</span>
            <span>Valor</span>
            <span>Dono</span>
            <span>Acoes</span>
          </div>
          {clients.map((client) => (
            <div key={client.id} className="data-row">
              <span>
                <strong>{client.name}</strong>
                <small>{client.email}</small>
              </span>
              <span>{client.contact}</span>
              <span>
                <select className="mini-select" value={client.stage} onChange={(event) => onStageChange(client.id, event.target.value as ClientStage)}>
                  {CLIENT_STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </span>
              <span>{currencyFormatter.format(client.value)}</span>
              <span>{client.owner}</span>
              <span className="row-actions">
                <button className="btn-icon" onClick={() => onEditClient(client)} title="Editar cliente">
                  <Edit size={14} />
                </button>
                <button className="btn-icon danger" onClick={() => onDeleteClient(client.id)} title="Excluir cliente">
                  <Trash2 size={14} />
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function DocsView({
  docs,
  selectedDoc,
  search,
  onSearch,
  onCreateDoc,
  onImport,
  onOpenDoc,
  onBack,
  onSaveDoc,
  onDeleteDoc,
  onToggleFavorite,
}: {
  docs: DocRecord[];
  selectedDoc: DocRecord | null;
  search: string;
  onSearch: (value: string) => void;
  onCreateDoc: () => void;
  onImport: () => void;
  onOpenDoc: (docId: string) => void;
  onBack: () => void;
  onSaveDoc: (event: FormEvent<HTMLFormElement>, docId: string) => void;
  onDeleteDoc: (docId: string) => void;
  onToggleFavorite: (docId: string) => void;
}) {
  if (selectedDoc) {
    return (
      <main className="main-area">
        <header className="top-nav">
          <div className="breadcrumb">
            <button className="btn-icon" onClick={onBack}>
              <ChevronRight className="rotate-180" size={14} />
            </button>
            <FileText size={14} color="#3b82f6" />
            <span>{selectedDoc.title}</span>
          </div>
          <div className="top-actions">
            <button className="btn-solid" onClick={() => onToggleFavorite(selectedDoc.id)}>
              <Star size={14} fill={selectedDoc.favorite ? "#eab308" : "none"} /> Favorito
            </button>
            <button className="btn-icon danger" onClick={() => onDeleteDoc(selectedDoc.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </header>

        <form className="doc-editor" onSubmit={(event) => onSaveDoc(event, selectedDoc.id)}>
          <input className="doc-title-input" name="title" defaultValue={selectedDoc.title} />
          <input className="crm-input" name="space" defaultValue={selectedDoc.space} aria-label="Espaco" />
          <textarea className="doc-content-input" name="content" defaultValue={selectedDoc.content} rows={18} />
          <div className="doc-actions">
            <span>Atualizado {formatDateTime(selectedDoc.updatedAt)}</span>
            <button className="btn-primary" type="submit">
              <Save size={14} /> Salvar documento
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="main-area">
      <TopBar title="Docs" subtitle={`${docs.length} documentos`} search={search} onSearch={onSearch} searchPlaceholder="Buscar docs" />
      <div className="crm-content">
        <div className="section-header">
          <div>
            <h2>Base de conhecimento</h2>
            <p>Crie, edite, favorite e exclua documentos do CRM.</p>
          </div>
          <div className="top-actions">
            <button className="btn-solid" onClick={onImport}>
              <Inbox size={14} /> Import
            </button>
            <button className="btn-primary" onClick={onCreateDoc}>
              <Plus size={14} /> New Doc
            </button>
          </div>
        </div>

        <div className="template-grid">
          <button
            className="template-card"
            onClick={() =>
              onOpenDoc(
                docs.find((doc) => doc.title === "Briefing de cliente")?.id ??
                  docs[0]?.id ??
                  "",
              )
            }
          >
            <ClipboardList size={20} color="#ea580c" />
            <strong>Briefing</strong>
            <span>Modelo de coleta inicial</span>
          </button>
          <button className="template-card" onClick={onCreateDoc}>
            <Sparkles size={20} color="#a855f7" />
            <strong>Documento vazio</strong>
            <span>Comece do zero</span>
          </button>
          <button className="template-card" onClick={onImport}>
            <FileText size={20} color="#3b82f6" />
            <strong>Importado</strong>
            <span>Cria doc para colar conteudo</span>
          </button>
        </div>

        <div className="table-card">
          <div className="data-row docs-row table-head">
            <span>Nome</span>
            <span>Local</span>
            <span>Atualizado</span>
            <span>Acoes</span>
          </div>
          {docs.map((doc) => (
            <div key={doc.id} className="data-row docs-row clickable" onClick={() => onOpenDoc(doc.id)}>
              <span>
                <FileText size={16} color="#3b82f6" />
                <strong>{doc.title}</strong>
              </span>
              <span>{doc.space}</span>
              <span>{formatDateTime(doc.updatedAt)}</span>
              <span className="row-actions">
                <button
                  className="btn-icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(doc.id);
                  }}
                  title="Favoritar"
                >
                  <Star size={14} fill={doc.favorite ? "#eab308" : "none"} />
                </button>
                <button
                  className="btn-icon danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteDoc(doc.id);
                  }}
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function ChatView({
  messages,
  team,
  bannerVisible,
  search,
  onSearch,
  onDismissBanner,
  onSendMessage,
  onOpenProfile,
  onCreateChannel,
}: {
  messages: ChatMessage[];
  team: TeamMember[];
  bannerVisible: boolean;
  search: string;
  onSearch: (value: string) => void;
  onDismissBanner: () => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onOpenProfile: () => void;
  onCreateChannel: () => void;
}) {
  return (
    <main className="main-area">
      <TopBar title="Chat" subtitle="Canal #general" search={search} onSearch={onSearch} searchPlaceholder="Buscar pessoas ou mensagens" />
      <div className="chat-layout">
        <aside className="chat-people">
          <button className="btn-primary full" onClick={onCreateChannel}>
            <Plus size={14} /> Add Channel
          </button>
          {team.map((member) => (
            <button key={member.id} className="person-row" onClick={onOpenProfile}>
              <span className={`presence ${member.status}`} />
              <span>{member.name}</span>
              <small>{member.role}</small>
            </button>
          ))}
        </aside>

        <section className="chat-main">
          {bannerVisible && (
            <div className="chat-banner">
              <span>Envie uma mensagem para iniciar a conversa do time GRX.</span>
              <button onClick={onDismissBanner}>Dismiss</button>
            </div>
          )}

          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className="message-card">
                <div className="comment-meta">
                  <strong>{message.author}</strong>
                  <span>{formatDateTime(message.createdAt)}</span>
                </div>
                <p>{message.body}</p>
              </div>
            ))}
          </div>

          <form className="message-form" onSubmit={onSendMessage}>
            <textarea name="body" placeholder="Escreva uma mensagem, use / para comandos" rows={3} />
            <div className="card-row">
              <button type="button" className="btn-solid" onClick={onOpenProfile}>
                <Eye size={14} /> View Profile
              </button>
              <button type="submit" className="btn-primary">
                <Send size={14} /> Enviar
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function TeamView({
  team,
  onCreateMember,
  onEditMember,
  onDeleteMember,
}: {
  team: TeamMember[];
  onCreateMember: () => void;
  onEditMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
}) {
  return (
    <main className="main-area">
      <header className="top-nav">
        <div>
          <h2>All People</h2>
          <span className="sidebar-subtitle">{team.length} membros no workspace</span>
        </div>
        <button className="btn-primary" onClick={onCreateMember}>
          <UserPlus size={14} /> Convidar
        </button>
      </header>

      <div className="crm-content">
        <div className="team-grid">
          {team.map((member) => (
            <article key={member.id} className="team-card">
              <div className="team-avatar">{member.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
                <small>{member.email}</small>
              </div>
              <span className={`member-status ${member.status}`}>{member.status}</span>
              <div className="card-row">
                <button className="btn-solid" onClick={() => onEditMember(member)}>
                  <Edit size={14} /> Editar
                </button>
                <button className="btn-icon danger" onClick={() => onDeleteMember(member.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function DashboardsView({
  tasks,
  clients,
  forms,
  cards,
  refreshedAt,
  editMode,
  onToggleEditMode,
  onRefresh,
  onAddCard,
  onDeleteCard,
}: {
  tasks: CrmTask[];
  clients: ClientRecord[];
  forms: FormRecord[];
  cards: DashboardCard[];
  refreshedAt: string;
  editMode: boolean;
  onToggleEditMode: () => void;
  onRefresh: () => void;
  onAddCard: () => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const openTasks = tasks.filter((task) => task.status !== "done").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const completed = tasks.filter((task) => task.status === "done").length;
  const pipeline = clients.reduce((sum, client) => sum + client.value, 0);
  const submissions = forms.reduce((sum, form) => sum + form.submissions.length, 0);
  const statusCounts = TASK_STATUSES.map((status) => tasks.filter((task) => task.status === status.id).length);
  const maxStatusCount = Math.max(...statusCounts, 1);

  return (
    <main className="main-area">
      <header className="top-nav">
        <div className="breadcrumb">
          <LayoutDashboard size={14} color="#a855f7" />
          <span>Dashboard Comercial</span>
          <Star size={14} className="text-secondary" />
        </div>
        <div className="top-actions">
          <button className="btn-solid" onClick={onToggleEditMode}>
            <Edit size={14} /> Edit mode: {editMode ? "On" : "Off"}
          </button>
          <button className="btn-solid" onClick={onRefresh}>
            <RefreshCcw size={14} /> Refreshed {formatDateTime(refreshedAt)}
          </button>
          <button className="btn-primary" onClick={onAddCard}>
            <Plus size={14} /> Add card
          </button>
        </div>
      </header>

      <div className="crm-content">
        <div className="metrics-grid five">
          <MetricCard icon={<CheckSquare size={18} />} label="Open tasks" value={String(openTasks)} />
          <MetricCard icon={<Activity size={18} />} label="In progress" value={String(inProgress)} />
          <MetricCard icon={<CheckCircle2 size={18} />} label="Completed" value={String(completed)} />
          <MetricCard icon={<DollarSign size={18} />} label="Pipeline" value={currencyFormatter.format(pipeline)} />
          <MetricCard icon={<BoxSelect size={18} />} label="Form leads" value={String(submissions)} />
        </div>

        <div className="dashboard-grid">
          <div className="panel dashboard-panel">
            <div className="panel-header">
              <h3>
                <Sparkles size={16} color="#a855f7" /> AI Executive Summary
              </h3>
              <button className="btn-icon" onClick={onRefresh}>
                <RefreshCcw size={14} />
              </button>
            </div>
            <p>
              O CRM possui {openTasks} tarefas abertas, {clients.length} clientes monitorados e {submissions} respostas de formulario.
              Priorize tarefas em risco e mantenha as oportunidades em proposta atualizadas.
            </p>
          </div>

          <div className="panel dashboard-panel">
            <div className="panel-header">
              <h3>
                <PieChart size={16} /> Workload by Status
              </h3>
            </div>
            <div className="bars">
              {TASK_STATUSES.map((status, index) => (
                <div key={status.id} className="bar-row">
                  <span>{status.label}</span>
                  <div>
                    <i style={{ width: `${(statusCounts[index] / maxStatusCount) * 100}%` }} />
                  </div>
                  <strong>{statusCounts[index]}</strong>
                </div>
              ))}
            </div>
          </div>

          {cards.map((card) => (
            <div key={card.id} className="panel dashboard-panel">
              <div className="panel-header">
                <h3>{card.title}</h3>
                {editMode && (
                  <button className="btn-icon danger" onClick={() => onDeleteCard(card.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <span className="big-number">{card.value}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function FormsView({
  forms,
  selectedForm,
  totalSubmissions,
  onSelectForm,
  onCreateForm,
  onEditForm,
  onDeleteForm,
  onSubmitResponse,
  onCreateTemplate,
}: {
  forms: FormRecord[];
  selectedForm: FormRecord | null;
  totalSubmissions: number;
  onSelectForm: (formId: string) => void;
  onCreateForm: () => void;
  onEditForm: (form: FormRecord) => void;
  onDeleteForm: (formId: string) => void;
  onSubmitResponse: (event: FormEvent<HTMLFormElement>, formId: string) => void;
  onCreateTemplate: (title: string, type: string, description: string) => void;
}) {
  return (
    <main className="main-area">
      <header className="top-nav">
        <div>
          <h2>Formularios</h2>
          <span className="sidebar-subtitle">{totalSubmissions} respostas registradas</span>
        </div>
        <button className="btn-primary" onClick={onCreateForm}>
          <Plus size={14} /> Novo formulario
        </button>
      </header>

      <div className="forms-layout">
        <section className="forms-list">
          <div className="template-grid vertical">
            <button className="template-card" onClick={() => onCreateTemplate("Pedido Comercial", "Order Form", "Capture pedidos e dados de compra.")}>
              <Inbox size={20} color="#8b5cf6" />
              <strong>Order Form</strong>
              <span>Adicionar modelo</span>
            </button>
            <button className="template-card" onClick={() => onCreateTemplate("Solicitacao de TI", "IT Request", "Triage tecnico e backlog de suporte.")}>
              <Settings size={20} color="#3b82f6" />
              <strong>IT Requests</strong>
              <span>Adicionar modelo</span>
            </button>
          </div>

          {forms.map((form) => (
            <button
              key={form.id}
              className={`form-list-item ${selectedForm?.id === form.id ? "active" : ""}`}
              onClick={() => onSelectForm(form.id)}
            >
              <BoxSelect size={16} />
              <span>
                <strong>{form.title}</strong>
                <small>{form.submissions.length} respostas</small>
              </span>
            </button>
          ))}
        </section>

        {selectedForm && (
          <section className="form-detail">
            <div className="section-header">
              <div>
                <h2>{selectedForm.title}</h2>
                <p>{selectedForm.description}</p>
              </div>
              <div className="top-actions">
                <button className="btn-solid" onClick={() => onEditForm(selectedForm)}>
                  <Edit size={14} /> Editar
                </button>
                <button className="btn-icon danger" onClick={() => onDeleteForm(selectedForm.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <form className="form-preview" onSubmit={(event) => onSubmitResponse(event, selectedForm.id)}>
              <label>
                Nome
                <input className="crm-input" name="name" placeholder="Nome do lead" />
              </label>
              <label>
                Email
                <input className="crm-input" name="email" placeholder="email@cliente.com" type="email" />
              </label>
              <label>
                Mensagem
                <textarea className="crm-input" name="message" placeholder="Descreva a demanda" rows={4} />
              </label>
              <button className="btn-primary" type="submit">
                <Send size={14} /> Enviar resposta teste
              </button>
            </form>

            <div className="panel">
              <div className="panel-header">
                <h3>Respostas</h3>
                <span>{selectedForm.submissions.length}</span>
              </div>
              {selectedForm.submissions.length === 0 ? (
                <p className="empty-copy">Nenhuma resposta ainda.</p>
              ) : (
                selectedForm.submissions.map((submission) => (
                  <div key={submission.id} className="submission-row">
                    <strong>{submission.name}</strong>
                    <span>{submission.email}</span>
                    <p>{submission.message}</p>
                    <small>{formatDateTime(submission.createdAt)}</small>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function TopBar({
  title,
  subtitle,
  search,
  onSearch,
  searchPlaceholder,
  onNotify,
}: {
  title: string;
  subtitle?: string;
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder: string;
  onNotify?: (message: string) => void;
}) {
  return (
    <header className="top-nav">
      <div className="breadcrumb">
        <div className="space-avatar" style={{ background: "#10b981", width: 18, height: 18, fontSize: 10 }}>
          G
        </div>
        <span>{title}</span>
        {subtitle && (
          <>
            <ChevronRight size={14} className="text-secondary" />
            <small className="text-secondary">{subtitle}</small>
          </>
        )}
      </div>

      <label className="global-search">
        <Search size={14} />
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={searchPlaceholder} />
      </label>

      <div className="top-actions">
        <button className="btn-solid" onClick={() => onNotify?.("Agents: proxima etapa sera conectar automacoes reais.")}>
          <Phone size={14} /> Agents
        </button>
        <button className="btn-solid" onClick={() => onNotify?.("Automacoes ficam prontas para ligar ao Supabase/N8N.")}>
          <Workflow size={14} /> Automate
        </button>
        <button className="btn-solid purple" onClick={() => onNotify?.("AI pronta para gerar resumos dos dados atuais.")}>
          <Bot size={14} /> Ask AI
        </button>
        <button className="btn-icon" onClick={() => onNotify?.("Link de compartilhamento preparado localmente.")}>
          <Share size={14} />
        </button>
      </div>
    </header>
  );
}

function TaskModal({
  modal,
  clients,
  team,
  onClose,
  onSubmit,
}: {
  modal: { mode: "create" | "edit"; task?: CrmTask; status?: TaskStatus };
  clients: ClientRecord[];
  team: TeamMember[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const task = modal.task;
  const defaultStatus = task?.status ?? modal.status ?? "todo";

  return (
    <Modal title={modal.mode === "edit" ? "Editar tarefa" : "Nova tarefa"} onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Titulo
          <input className="crm-input" name="title" defaultValue={task?.title} autoFocus />
        </label>
        <div className="form-grid">
          <label>
            Cliente
            <input className="crm-input" name="client" defaultValue={task?.client ?? clients[0]?.name ?? "GRX Intelligence"} list="clients-list" />
          </label>
          <label>
            Responsavel
            <select className="crm-input" name="assignee" defaultValue={task?.assignee ?? team[0]?.name ?? "Gustavo Roque"}>
              {team.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select className="crm-input" name="status" defaultValue={defaultStatus}>
              {TASK_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Prioridade
            <select className="crm-input" name="priority" defaultValue={task?.priority ?? "medium"}>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <label>
            Prazo
            <input className="crm-input" type="date" name="dueDate" defaultValue={task?.dueDate} />
          </label>
          <label>
            Tag
            <input className="crm-input" name="tag" defaultValue={task?.tag ?? "CRM"} />
          </label>
        </div>
        <label>
          Descricao
          <textarea className="crm-input" name="description" defaultValue={task?.description} rows={4} />
        </label>
        <datalist id="clients-list">
          {clients.map((client) => (
            <option key={client.id} value={client.name} />
          ))}
        </datalist>
        <ModalActions onClose={onClose} submitLabel={modal.mode === "edit" ? "Salvar tarefa" : "Criar tarefa"} />
      </form>
    </Modal>
  );
}

function ClientModal({
  modal,
  onClose,
  onSubmit,
}: {
  modal: { mode: "create" | "edit"; client?: ClientRecord };
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const client = modal.client;
  return (
    <Modal title={modal.mode === "edit" ? "Editar cliente" : "Novo cliente"} onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Nome da conta
          <input className="crm-input" name="name" defaultValue={client?.name} autoFocus />
        </label>
        <div className="form-grid">
          <label>
            Contato
            <input className="crm-input" name="contact" defaultValue={client?.contact} />
          </label>
          <label>
            Email
            <input className="crm-input" name="email" type="email" defaultValue={client?.email} />
          </label>
          <label>
            Telefone
            <input className="crm-input" name="phone" defaultValue={client?.phone} />
          </label>
          <label>
            Etapa
            <select className="crm-input" name="stage" defaultValue={client?.stage ?? "lead"}>
              {CLIENT_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Valor
            <input className="crm-input" name="value" type="number" defaultValue={client?.value ?? 0} />
          </label>
          <label>
            Dono
            <input className="crm-input" name="owner" defaultValue={client?.owner ?? "Gustavo Roque"} />
          </label>
        </div>
        <label>
          Notas
          <textarea className="crm-input" name="notes" defaultValue={client?.notes} rows={4} />
        </label>
        <ModalActions onClose={onClose} submitLabel={modal.mode === "edit" ? "Salvar cliente" : "Criar cliente"} />
      </form>
    </Modal>
  );
}

function MemberModal({
  modal,
  onClose,
  onSubmit,
}: {
  modal: { mode: "create" | "edit"; member?: TeamMember };
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const member = modal.member;
  return (
    <Modal title={modal.mode === "edit" ? "Editar membro" : "Convidar membro"} onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Nome
          <input className="crm-input" name="name" defaultValue={member?.name} autoFocus />
        </label>
        <label>
          Cargo
          <input className="crm-input" name="role" defaultValue={member?.role} />
        </label>
        <label>
          Email
          <input className="crm-input" name="email" type="email" defaultValue={member?.email} />
        </label>
        <label>
          Status
          <select className="crm-input" name="status" defaultValue={member?.status ?? "online"}>
            <option value="online">online</option>
            <option value="busy">busy</option>
            <option value="offline">offline</option>
          </select>
        </label>
        <ModalActions onClose={onClose} submitLabel={modal.mode === "edit" ? "Salvar membro" : "Convidar"} />
      </form>
    </Modal>
  );
}

function FormModal({
  modal,
  onClose,
  onSubmit,
}: {
  modal: { mode: "create" | "edit"; form?: FormRecord };
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const form = modal.form;
  return (
    <Modal title={modal.mode === "edit" ? "Editar formulario" : "Novo formulario"} onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Titulo
          <input className="crm-input" name="title" defaultValue={form?.title} autoFocus />
        </label>
        <label>
          Tipo
          <input className="crm-input" name="type" defaultValue={form?.type ?? "Personalizado"} />
        </label>
        <label>
          Descricao
          <textarea className="crm-input" name="description" defaultValue={form?.description} rows={4} />
        </label>
        <ModalActions onClose={onClose} submitLabel={modal.mode === "edit" ? "Salvar formulario" : "Criar formulario"} />
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-icon" onClick={onClose} title="Fechar">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return (
    <div className="modal-actions">
      <button type="button" className="btn-solid" onClick={onClose}>
        Cancelar
      </button>
      <button type="submit" className="btn-primary">
        <Save size={14} /> {submitLabel}
      </button>
    </div>
  );
}

function SyncIndicator({ status }: { status: SyncStatus }) {
  const labels: Record<SyncStatus, string> = {
    local: "Local",
    loading: "Conectando",
    synced: "Supabase",
    error: "Fallback local",
  };

  return (
    <div className={`sync-indicator ${status}`} title="Status de persistencia do CRM">
      <span />
      {labels[status]}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="info-row">
      <div>
        {icon}
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function ActivityLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="activity-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
