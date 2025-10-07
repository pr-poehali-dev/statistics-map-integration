import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

type UserRole = 'user' | 'admin';

interface Enterprise {
  id: number;
  name: string;
  region: string;
  employees: number;
  repairStats: {
    completed: number;
    pending: number;
    overdue: number;
  };
  deviations: Deviation[];
  coordinates: { x: number; y: number };
}

interface Deviation {
  id: number;
  type: string;
  deadline: string;
  responsible: string;
  description: string;
  status: 'critical' | 'warning' | 'normal';
}

const mockEnterprises: Enterprise[] = [
  {
    id: 1,
    name: 'Московский завод',
    region: 'Москва',
    employees: 1247,
    repairStats: { completed: 89, pending: 12, overdue: 3 },
    deviations: [
      { id: 1, type: 'Превышение сроков ремонта', deadline: '2025-10-15', responsible: 'Иванов И.И.', description: 'Задержка поставки запчастей для оборудования цеха №3', status: 'critical' },
      { id: 2, type: 'Недокомплект персонала', deadline: '2025-10-20', responsible: 'Петров П.П.', description: 'Требуется 5 механиков для обслуживания нового оборудования', status: 'warning' }
    ],
    coordinates: { x: 55, y: 37 }
  },
  {
    id: 2,
    name: 'Санкт-Петербургский комбинат',
    region: 'Санкт-Петербург',
    employees: 892,
    repairStats: { completed: 76, pending: 8, overdue: 1 },
    deviations: [
      { id: 3, type: 'Превышение бюджета', deadline: '2025-11-01', responsible: 'Сидоров С.С.', description: 'Перерасход на закупку материалов составил 12%', status: 'warning' }
    ],
    coordinates: { x: 60, y: 30 }
  },
  {
    id: 3,
    name: 'Екатеринбургский завод',
    region: 'Свердловская область',
    employees: 1534,
    repairStats: { completed: 102, pending: 15, overdue: 2 },
    deviations: [
      { id: 4, type: 'Нарушение технологии', deadline: '2025-10-25', responsible: 'Козлов К.К.', description: 'Выявлено отклонение от технологического процесса в цехе №7', status: 'critical' },
      { id: 5, type: 'Превышение сроков ремонта', deadline: '2025-10-18', responsible: 'Морозов М.М.', description: 'Задержка планового ремонта печного оборудования', status: 'warning' }
    ],
    coordinates: { x: 57, y: 61 }
  },
  {
    id: 4,
    name: 'Новосибирский завод',
    region: 'Новосибирская область',
    employees: 678,
    repairStats: { completed: 45, pending: 6, overdue: 0 },
    deviations: [],
    coordinates: { x: 55, y: 83 }
  },
  {
    id: 5,
    name: 'Казанский завод',
    region: 'Татарстан',
    employees: 1089,
    repairStats: { completed: 67, pending: 9, overdue: 1 },
    deviations: [
      { id: 6, type: 'Недокомплект персонала', deadline: '2025-10-30', responsible: 'Андреев А.А.', description: 'Необходимы 3 инженера-технолога', status: 'warning' }
    ],
    coordinates: { x: 55, y: 49 }
  }
];

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise>(mockEnterprises[0]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState<number[]>([]);
  const [selectedDeviationTypes, setSelectedDeviationTypes] = useState<string[]>([]);
  const [selectedResponsible, setSelectedResponsible] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [hoveredEnterprise, setHoveredEnterprise] = useState<number | null>(null);

  const regions = Array.from(new Set(mockEnterprises.map(e => e.region)));
  const deviationTypes = Array.from(new Set(mockEnterprises.flatMap(e => e.deviations.map(d => d.type))));
  const responsiblePersons = Array.from(new Set(mockEnterprises.flatMap(e => e.deviations.map(d => d.responsible))));

  const filteredEnterprises = userRole === 'admin' 
    ? mockEnterprises.filter(e => {
        const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(e.region);
        const enterpriseMatch = selectedEnterprises.length === 0 || selectedEnterprises.includes(e.id);
        const deviationTypeMatch = selectedDeviationTypes.length === 0 || 
          e.deviations.some(d => selectedDeviationTypes.includes(d.type));
        const responsibleMatch = selectedResponsible.length === 0 || 
          e.deviations.some(d => selectedResponsible.includes(d.responsible));
        
        return regionMatch && enterpriseMatch && deviationTypeMatch && responsibleMatch;
      })
    : [selectedEnterprise];

  const totalStats = filteredEnterprises.reduce((acc, e) => ({
    employees: acc.employees + e.employees,
    completed: acc.completed + e.repairStats.completed,
    pending: acc.pending + e.repairStats.pending,
    overdue: acc.overdue + e.repairStats.overdue,
    deviations: acc.deviations + e.deviations.length
  }), { employees: 0, completed: 0, pending: 0, overdue: 0, deviations: 0 });

  const allDeviations = filteredEnterprises.flatMap(e => 
    e.deviations.map(d => ({ ...d, enterpriseName: e.name, region: e.region }))
  );

  const groupedDeviations = allDeviations.reduce((acc, dev) => {
    if (!acc[dev.type]) acc[dev.type] = [];
    acc[dev.type].push(dev);
    return acc;
  }, {} as Record<string, any[]>);

  const groupedByResponsible = allDeviations.reduce((acc, dev) => {
    if (!acc[dev.responsible]) acc[dev.responsible] = [];
    acc[dev.responsible].push(dev);
    return acc;
  }, {} as Record<string, any[]>);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Icon name="Building2" size={32} className="text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Корпоративный портал</CardTitle>
            <p className="text-sm text-muted-foreground">Система мониторинга предприятий холдинга</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Логин</label>
              <Input placeholder="Введите логин" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input type="password" placeholder="Введите пароль" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Роль</label>
              <Select value={userRole} onValueChange={(value: UserRole) => setUserRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <Icon name="User" size={16} />
                      Пользователь
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Icon name="Shield" size={16} />
                      Администратор
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" size="lg" onClick={() => setIsAuthenticated(true)}>
              Войти в систему
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Icon name="Building2" size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Корпоративный портал</h1>
                <p className="text-xs text-muted-foreground">
                  {userRole === 'admin' ? 'Администратор' : 'Пользователь'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Icon name="Bell" size={18} className="mr-2" />
                Уведомления
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Settings" size={18} className="mr-2" />
                Настройки
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAuthenticated(false)}
              >
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b bg-card">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            <Button variant="ghost" className="rounded-none border-b-2 border-primary px-4 py-3 font-medium">
              <Icon name="BarChart3" size={18} className="mr-2" />
              Статистика
            </Button>
            <Button variant="ghost" className="rounded-none px-4 py-3 text-muted-foreground">
              <Icon name="FileText" size={18} className="mr-2" />
              Отчёты
            </Button>
            <Button variant="ghost" className="rounded-none px-4 py-3 text-muted-foreground">
              <Icon name="Settings" size={18} className="mr-2" />
              Управление
            </Button>
            <Button variant="ghost" className="rounded-none px-4 py-3 text-muted-foreground">
              <Icon name="HelpCircle" size={18} className="mr-2" />
              Справка
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {userRole === 'admin' ? 'Все предприятия' : 'Мое предприятие'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {userRole === 'admin' 
                ? `Отображено предприятий: ${filteredEnterprises.length} из ${mockEnterprises.length}`
                : selectedEnterprise.name
              }
            </p>
          </div>
          {userRole === 'admin' && (
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Icon name="Filter" size={18} className="mr-2" />
                  Фильтры
                  {(selectedRegions.length > 0 || selectedEnterprises.length > 0 || 
                    selectedDeviationTypes.length > 0 || selectedResponsible.length > 0) && (
                    <Badge variant="secondary" className="ml-2 bg-white">
                      {selectedRegions.length + selectedEnterprises.length + 
                       selectedDeviationTypes.length + selectedResponsible.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[450px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Icon name="SlidersHorizontal" size={20} />
                    Настройка фильтров
                  </SheetTitle>
                </SheetHeader>
                
                <Tabs defaultValue="basic" className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Основные</TabsTrigger>
                    <TabsTrigger value="advanced">Дополнительные</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-6 mt-6">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Icon name="MapPin" size={16} />
                          Регионы
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedRegions(
                            selectedRegions.length === regions.length ? [] : regions
                          )}
                        >
                          {selectedRegions.length === regions.length ? 'Сбросить' : 'Выбрать все'}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {regions.map(region => (
                          <div key={region} className="flex items-center space-x-2">
                            <Checkbox 
                              id={region}
                              checked={selectedRegions.includes(region)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRegions([...selectedRegions, region]);
                                } else {
                                  setSelectedRegions(selectedRegions.filter(r => r !== region));
                                }
                              }}
                            />
                            <label htmlFor={region} className="text-sm cursor-pointer flex-1">
                              {region}
                            </label>
                            <Badge variant="outline" className="text-xs">
                              {mockEnterprises.filter(e => e.region === region).length}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Icon name="Building2" size={16} />
                          Предприятия
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedEnterprises(
                            selectedEnterprises.length === mockEnterprises.length 
                              ? [] 
                              : mockEnterprises.map(e => e.id)
                          )}
                        >
                          {selectedEnterprises.length === mockEnterprises.length ? 'Сбросить' : 'Выбрать все'}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {mockEnterprises.map(enterprise => (
                          <div key={enterprise.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`ent-${enterprise.id}`}
                              checked={selectedEnterprises.includes(enterprise.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEnterprises([...selectedEnterprises, enterprise.id]);
                                } else {
                                  setSelectedEnterprises(selectedEnterprises.filter(id => id !== enterprise.id));
                                }
                              }}
                            />
                            <label htmlFor={`ent-${enterprise.id}`} className="text-sm cursor-pointer flex-1">
                              {enterprise.name}
                            </label>
                            {enterprise.deviations.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {enterprise.deviations.length}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6 mt-6">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Icon name="AlertTriangle" size={16} />
                          Тип отклонения
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedDeviationTypes(
                            selectedDeviationTypes.length === deviationTypes.length 
                              ? [] 
                              : deviationTypes
                          )}
                        >
                          {selectedDeviationTypes.length === deviationTypes.length ? 'Сбросить' : 'Выбрать все'}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {deviationTypes.map(type => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`type-${type}`}
                              checked={selectedDeviationTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedDeviationTypes([...selectedDeviationTypes, type]);
                                } else {
                                  setSelectedDeviationTypes(selectedDeviationTypes.filter(t => t !== type));
                                }
                              }}
                            />
                            <label htmlFor={`type-${type}`} className="text-sm cursor-pointer flex-1">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Icon name="UserCheck" size={16} />
                          Ответственный
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedResponsible(
                            selectedResponsible.length === responsiblePersons.length 
                              ? [] 
                              : responsiblePersons
                          )}
                        >
                          {selectedResponsible.length === responsiblePersons.length ? 'Сбросить' : 'Выбрать все'}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {responsiblePersons.map(person => (
                          <div key={person} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`resp-${person}`}
                              checked={selectedResponsible.includes(person)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedResponsible([...selectedResponsible, person]);
                                } else {
                                  setSelectedResponsible(selectedResponsible.filter(p => p !== person));
                                }
                              }}
                            />
                            <label htmlFor={`resp-${person}`} className="text-sm cursor-pointer flex-1">
                              {person}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 pt-6 border-t mt-6">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedRegions([]);
                      setSelectedEnterprises([]);
                      setSelectedDeviationTypes([]);
                      setSelectedResponsible([]);
                    }}
                  >
                    <Icon name="RotateCcw" size={16} className="mr-2" />
                    Сбросить всё
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setFilterOpen(false)}
                  >
                    <Icon name="Check" size={16} className="mr-2" />
                    Применить
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Map" size={20} />
                  Карта РФ
                  {userRole === 'admin' && (
                    <Badge variant="outline" className="ml-2">
                      {filteredEnterprises.length} предприятий
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-[600px] overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border-2 border-blue-200">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    <rect x="8" y="18" width="84" height="64" rx="6" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.5" opacity="0.6" />
                    
                    {filteredEnterprises.map((enterprise) => {
                      const isHighlighted = hoveredEnterprise === enterprise.id || 
                        (userRole === 'user' && enterprise.id === selectedEnterprise.id);
                      const hasDeviations = enterprise.deviations.length > 0;
                      
                      return (
                        <g 
                          key={enterprise.id}
                          className="cursor-pointer transition-all duration-200"
                          onClick={() => {
                            if (userRole === 'user') {
                              setSelectedEnterprise(enterprise);
                            }
                          }}
                          onMouseEnter={() => setHoveredEnterprise(enterprise.id)}
                          onMouseLeave={() => setHoveredEnterprise(null)}
                          style={{ transform: isHighlighted ? 'scale(1.1)' : 'scale(1)' }}
                        >
                          <circle 
                            cx={enterprise.coordinates.x} 
                            cy={enterprise.coordinates.y} 
                            r={isHighlighted ? "4" : "3"} 
                            fill={hasDeviations ? '#dc2626' : '#10b981'}
                            filter={isHighlighted ? "url(#glow)" : "none"}
                          />
                          <circle 
                            cx={enterprise.coordinates.x} 
                            cy={enterprise.coordinates.y} 
                            r={isHighlighted ? "7" : "6"} 
                            fill={hasDeviations ? '#dc2626' : '#10b981'}
                            opacity="0.25"
                            className="animate-pulse"
                          />
                          <text 
                            x={enterprise.coordinates.x} 
                            y={enterprise.coordinates.y - 9} 
                            fontSize={isHighlighted ? "3.5" : "3"} 
                            fill="#1e293b"
                            textAnchor="middle"
                            fontWeight="600"
                          >
                            {enterprise.name.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="text-xs font-semibold mb-2">Легенда:</div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-xs">Без отклонений</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-600"></div>
                        <span className="text-xs">Есть отклонения</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Info" size={18} />
                  {userRole === 'admin' ? 'Сводная информация' : selectedEnterprise.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground mb-1">Регион</div>
                    <div className="font-semibold text-sm">
                      {userRole === 'admin' 
                        ? `${selectedRegions.length > 0 ? selectedRegions.length : regions.length} регионов`
                        : selectedEnterprise.region
                      }
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground mb-1">Сотрудников</div>
                    <div className="font-bold text-lg">{totalStats.employees.toLocaleString()}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="Wrench" size={16} />
                    <span className="text-sm font-semibold">Статистика ремонта</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-2">
                      <span className="text-sm">Завершено</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        {totalStats.completed}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2">
                      <span className="text-sm">В работе</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        {totalStats.pending}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-red-50 p-2">
                      <span className="text-sm">Просрочено</span>
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                        {totalStats.overdue}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="AlertTriangle" size={16} className="text-destructive" />
                      <span className="text-sm font-semibold">Статус отклонения</span>
                    </div>
                    <Badge variant="destructive" className="text-base px-3">
                      {totalStats.deviations}
                    </Badge>
                  </div>

                  {userRole === 'admin' && allDeviations.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2">По типам:</div>
                      {Object.entries(groupedDeviations).map(([type, devs]) => (
                        <div key={type} className="flex items-center justify-between text-xs bg-muted/30 rounded p-2">
                          <span className="flex-1">{type}</span>
                          <Badge variant="outline" className="text-xs">
                            {devs.length}
                          </Badge>
                        </div>
                      ))}
                      
                      <div className="text-xs font-medium text-muted-foreground mt-3 mb-2">По ответственным:</div>
                      {Object.entries(groupedByResponsible).map(([person, devs]) => (
                        <div key={person} className="flex items-center justify-between text-xs bg-muted/30 rounded p-2">
                          <span className="flex-1">{person}</span>
                          <Badge variant="outline" className="text-xs">
                            {devs.length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {allDeviations.length > 0 ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default" className="w-full" size="sm">
                          <Icon name="FileText" size={16} className="mr-2" />
                          Подробнее
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Icon name="AlertCircle" size={20} />
                            Информация об отклонениях
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 mt-4">
                          {allDeviations.map((deviation: any) => (
                            <Card key={deviation.id} className="border-l-4" style={{
                              borderLeftColor: deviation.status === 'critical' ? '#dc2626' : '#f59e0b'
                            }}>
                              <CardContent className="pt-4">
                                <div className="mb-3 flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-base mb-1">{deviation.type}</h4>
                                    {userRole === 'admin' && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Icon name="Building2" size={14} />
                                        {deviation.enterpriseName} • {deviation.region}
                                      </div>
                                    )}
                                  </div>
                                  <Badge variant={deviation.status === 'critical' ? 'destructive' : 'outline'}>
                                    {deviation.status === 'critical' ? 'Критично' : 'Предупреждение'}
                                  </Badge>
                                </div>
                                <p className="mb-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                                  {deviation.description}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Icon name="Calendar" size={14} className="text-muted-foreground" />
                                    <div>
                                      <div className="text-xs text-muted-foreground">Срок</div>
                                      <div className="font-medium">
                                        {new Date(deviation.deadline).toLocaleDateString('ru-RU')}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Icon name="User" size={14} className="text-muted-foreground" />
                                    <div>
                                      <div className="text-xs text-muted-foreground">Ответственный</div>
                                      <div className="font-medium">{deviation.responsible}</div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                      <Icon name="CheckCircle2" size={24} className="mx-auto mb-2 text-green-600" />
                      <div className="text-sm font-medium text-green-700">
                        Отклонений не обнаружено
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
